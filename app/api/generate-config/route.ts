import { db } from "@/config/db";
import { openrouter } from "@/config/openrouter";
import { ProjectTable, ScreenCongifTable } from "@/config/schema";
import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, device, projectId } = body;

    console.log("REQUEST BODY:", body);

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    /* ---------------- AI CALL ---------------- */
    const aiResult = await openrouter.chat.send({
      chatGenerationParams: {
        model: "deepseek/deepseek-chat",
        stream: false,
        messages: [
          {
            role: "system",
            content: APP_LAYOUT_CONFIG_PROMPT.replace(
              "{deviceType}",
              device
            ),
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      },
    });

    console.log("AI RESULT:", aiResult);

    if (!aiResult?.choices?.length) {
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    let textContent = aiResult.choices[0]?.message?.content ?? "";

    if (Array.isArray(textContent)) {
      textContent = textContent
        .map((item: any) => item?.text || "")
        .join("");
    }

    console.log("RAW AI TEXT:", textContent);

    /* ---------------- CLEAN JSON ---------------- */
    let JSONAiResult;
    try {
      // Extract first JSON object from AI response (supports multiline)
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");

      JSONAiResult = JSON.parse(jsonMatch[0]);
      console.log("AI JSON RESULT:", JSONAiResult);
    } catch (parseError) {
      console.error("JSON PARSE ERROR:", parseError);
      console.log("RAW AI RESPONSE:", textContent);

      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: textContent },
        { status: 500 }
      );
    }

    if (!JSONAiResult) {
      return NextResponse.json(
        { error: "AI returned empty JSON" },
        { status: 500 }
      );
    }

    /* ---------------- FALLBACK THEME ---------------- */
    const theme = JSONAiResult.theme || "DUSTY_ORCHID";

    /* ---------------- UPDATE PROJECT ---------------- */
    await db
      .update(ProjectTable)
      .set({
        projectName: JSONAiResult.projectName || "Untitled Project",
        projectVisualDescription:
          JSONAiResult.projectVisualDescription || "",
        theme: theme,
      })
      .where(eq(ProjectTable.projectId, projectId));

    const updatedProject = await db
      .select()
      .from(ProjectTable)
      .where(eq(ProjectTable.projectId, projectId));

    console.log("PROJECT UPDATED:", updatedProject[0]);

    /* ---------------- INSERT SCREENS ---------------- */
    if (Array.isArray(JSONAiResult.screens)) {
      for (const screen of JSONAiResult.screens) {
        try {
          const existing = await db
            .select()
            .from(ScreenCongifTable)
            .where(
              and(
                eq(ScreenCongifTable.projectId, projectId),
                eq(ScreenCongifTable.screenId, screen.id)
              )
            );

          if (existing.length === 0) {
            await db.insert(ScreenCongifTable).values({
              projectId: projectId,
              screenId: screen.id,
              screenName: screen.name,
              purpose: screen.purpose,
              screenDescription: screen.layoutDescription,
            });

            console.log("SCREEN INSERTED:", screen.id);
          } else {
            console.log("SCREEN ALREADY EXISTS:", screen.id);
          }
        } catch (insertError) {
          console.error("SCREEN INSERT ERROR:", insertError);
        }
      }
    }

    /* ---------------- SUCCESS ---------------- */
    return NextResponse.json({
      success: true,
      data: JSONAiResult,
      theme: theme,
    });
  } catch (error) {
    console.error("API ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}