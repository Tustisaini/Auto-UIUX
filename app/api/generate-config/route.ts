import { db } from "@/config/db";
import { openrouter } from "@/config/openrouter";
import { ProjectTable, ScreenCongifTable } from "@/config/schema";
import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userInput, deviceType, projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    // 1️⃣ Call AI
    const aiResult = await openrouter.chat.send({
      chatGenerationParams: {
        model: "stepfun/step-3.5-flash:free",
        stream: false,
        messages: [
          {
            role: "system",
            content: APP_LAYOUT_CONFIG_PROMPT.replace(
              "{deviceType}",
              deviceType
            ),
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      },
    });

    // 2️⃣ Normalize AI response → string
    const content = aiResult?.choices?.[0]?.message?.content;

    const textContent =
      typeof content === "string"
        ? content
        : Array.isArray(content)
        ? content
            .map((item) =>
              typeof item === "object" && "text" in item
                ? item.text
                : ""
            )
            .join("")
        : "";

    console.log("🧠 RAW AI TEXT:", textContent);

    // 3️⃣ Parse JSON
    const JSONAiResult = JSON.parse(textContent);

    if (!JSONAiResult) {
      throw new Error("AI returned empty JSON");
    }

    // 4️⃣ Update existing project (NO new row)
    await db
      .update(ProjectTable)
      .set({
        projectName: JSONAiResult.projectName ?? null,
        projectVisualDescription:
          JSONAiResult.projectVisualDescription ?? null,
        theme: JSONAiResult.theme ?? null, // ✅ THEME SAVED HERE
      })
      .where(eq(ProjectTable.projectId, projectId));

    // 5️⃣ Fetch & log updated project
    const updatedProject = await db
      .select()
      .from(ProjectTable)
      .where(eq(ProjectTable.projectId, projectId));

    console.log("📦 PROJECT DETAILS:", updatedProject[0]);

    // 6️⃣ Insert screens (same logic as before)
    if (Array.isArray(JSONAiResult.screens)) {
      for (const screen of JSONAiResult.screens) {
        await db.insert(ScreenCongifTable).values({
          projectId: projectId,
          screenId: screen.id,
          screenName: screen.name,
          purpose: screen.purpose,
          screenDescription: screen.layoutDescription,
        });
      }
    }

    // 7️⃣ Return JSON to frontend
    return NextResponse.json({ JSONAiResult });
  } catch (error) {
    console.error("❌ AI route error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
