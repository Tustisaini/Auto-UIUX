"use server";

import { db } from "@/config/db";
import { openrouter } from "@/config/openrouter";
import { ProjectTable, ScreenCongifTable } from "@/config/schema"; // Correct table name
import { APP_LAYOUT_CONFIG_PROMPT, GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

/* ================= POST: Generate / Update Screens ================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, device = "mobile", projectId, theme, oldScreenDescription } = body;

    if (!projectId)
      return NextResponse.json({ success: false, error: "Missing projectId" }, { status: 400 });

    const systemPrompt = oldScreenDescription
      ? GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT.replace("{deviceType}", device).replace("{theme}", theme || "AUROR_INK")
      : APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", device);

    const userPrompt = oldScreenDescription
      ? `OLD:\n${oldScreenDescription}\n\nNEW:\n${userInput}`
      : userInput;

    // --- AI Call ---
    let aiResult;
    try {
      aiResult = await openrouter.chat.send({
        chatGenerationParams: {
          model: "openai/gpt-4o-mini",
          stream: false,
          messages: [
            { role: "system", content: [{ type: "text", text: systemPrompt }] },
            { role: "user", content: [{ type: "text", text: userPrompt }] },
          ],
        },
      });
    } catch (aiErr) {
      console.error("AI ERROR:", aiErr);
      return NextResponse.json({ success: false, error: "AI request failed" }, { status: 500 });
    }

    let textContent = aiResult?.choices?.[0]?.message?.content ?? "";
    if (Array.isArray(textContent)) textContent = textContent.map((i: any) => i?.text || "").join("");

    // --- Parse JSON safely ---
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    let data: any = {};
    if (jsonMatch) {
      try {
        data = JSON.parse(jsonMatch[0]);
      } catch (jsonErr) {
        console.error("JSON parse failed:", jsonErr);
      }
    }

    // --- Upsert Screens in DB ---
    if (Array.isArray(data?.screens)) {
      for (const screen of data.screens) {
        if (!screen?.id) continue;

        const screenName = screen.name || screen.screenName || screen.title || "Screen";

        const exists = await db.select().from(ScreenCongifTable)
          .where(and(eq(ScreenCongifTable.projectId, projectId), eq(ScreenCongifTable.screenId, screen.id)));

        if (exists.length === 0) {
          await db.insert(ScreenCongifTable).values({
            projectId,
            screenId: screen.id,
            screenName,
            purpose: screen.purpose ?? "",
            screenDescription: screen.layoutDescription ?? "",
          });
        } else {
          await db.update(ScreenCongifTable).set({
            screenName,
            purpose: screen.purpose ?? "",
            screenDescription: screen.layoutDescription ?? "",
          }).where(and(eq(ScreenCongifTable.projectId, projectId), eq(ScreenCongifTable.screenId, screen.id)));
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/* ================= DELETE: Delete a Screen ================= */
export async function DELETE(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const screenId = req.nextUrl.searchParams.get("screenId");

    if (!projectId || !screenId) {
      return NextResponse.json({ success: false, error: "Missing projectId or screenId" }, { status: 400 });
    }

    await db.delete(ScreenCongifTable).where(
      and(eq(ScreenCongifTable.projectId, projectId), eq(ScreenCongifTable.screenId, screenId))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete screen:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}