import { db } from "@/config/db";
import { openrouter } from "@/config/openrouter";
import { ProjectTable, ScreenCongifTable } from "@/config/schema";
import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ default device (prevents 400)
    const {
      userInput,
      device = "mobile",
      projectId,
      projectName,
      theme,
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    /* ================= SIMPLE UPDATE ================= */
    if (!userInput) {
      const updateData: any = {};

      if (projectName !== undefined) updateData.projectName = projectName;
      if (theme !== undefined) updateData.theme = theme;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
      }

      await db
        .update(ProjectTable)
        .set(updateData)
        .where(eq(ProjectTable.projectId, projectId));

      return NextResponse.json({
        success: true,
        mode: "simple-update",
        updated: updateData,
      });
    }

    /* ================= AI MODE ================= */
    const aiResult = await openrouter.chat.send({
      chatGenerationParams: {
        model: "deepseek/deepseek-chat",
        stream: false,
        messages: [
          {
            role: "system",
            content: APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", device),
          },
          { role: "user", content: userInput },
        ],
      },
    });

    let textContent = aiResult?.choices?.[0]?.message?.content ?? "";

    if (Array.isArray(textContent)) {
      textContent = textContent.map((item: any) => item?.text || "").join("");
    }

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI JSON" }, { status: 500 });
    }

    const JSONAiResult = JSON.parse(jsonMatch[0]);

    const finalTheme = JSONAiResult.theme ?? "AUROR_INK";

    await db
      .update(ProjectTable)
      .set({
        projectName: JSONAiResult.projectName ?? "Untitled Project",
        projectVisualDescription:
          JSONAiResult.projectVisualDescription ?? "",
        theme: finalTheme,
        device,
      })
      .where(eq(ProjectTable.projectId, projectId));

    if (Array.isArray(JSONAiResult.screens)) {
      for (const screen of JSONAiResult.screens) {
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
            projectId,
            screenId: screen.id,
            screenName: screen.name,
            purpose: screen.purpose,
            screenDescription: screen.layoutDescription,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode: "ai",
      data: JSONAiResult,
      theme: finalTheme,
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('projectId');
  const screenId = req.nextUrl.searchParams.get('screenId');

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ msg: 'Unauthorized User' }, { status: 401 });
  }

  // ✅ FIX: null safety check
  if (!projectId || !screenId) {
    return NextResponse.json(
      { msg: 'Missing projectId or screenId' },
      { status: 400 }
    );
  }

  const result = await db
    .delete(ScreenCongifTable)
    .where(
      and(
        eq(ScreenCongifTable.screenId, screenId), // ✅ now always string
        eq(ScreenCongifTable.projectId, projectId)
      )
    );

  return NextResponse.json({ msg: 'Deleted' });
}