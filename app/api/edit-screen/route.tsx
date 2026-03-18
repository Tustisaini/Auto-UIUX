"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { openrouter } from "@/config/openrouter";
import { ScreenCongifTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { GENERATE_SCREEN_PROMPT } from "@/data/Prompt";

export async function POST(req: NextRequest) {
  try {
    const { projectId, screenId, oldCode, userInput } = await req.json();

    console.log("📩 EDIT SCREEN REQUEST:", {
      projectId,
      screenId,
      hasOldCode: !!oldCode,
      userInput,
    });

    // ✅ Validate input
    if (!projectId || !screenId || !userInput) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    let aiResult: any;

    /* ================= AI CALL ================= */
    try {
      aiResult = await openrouter.chat.send({
        chatGenerationParams: {
          model: "stepfun/step-3.5-flash:free",
          stream: false,
          messages: [
            {
              role: "system",
              content: GENERATE_SCREEN_PROMPT,
            },
            {
              role: "user",
              content: `
You are editing an existing UI.

STRICT RULES:
- Keep the design, layout, spacing, and styling EXACTLY the same
- Do NOT redesign anything
- Only apply the requested change
- Do NOT remove unrelated sections
- Return ONLY updated HTML + TailwindCSS code (no explanation)

USER REQUEST:
${userInput}

EXISTING CODE:
${oldCode || ""}
              `,
            },
          ],
        },
      });

      console.log("🤖 AI RESULT:", aiResult);
    } catch (aiErr) {
      console.error("❌ AI ERROR:", aiErr);
      return NextResponse.json(
        { success: false, error: "AI request failed" },
        { status: 500 }
      );
    }

    /* ================= PARSE AI RESPONSE ================= */
    let codeRaw = aiResult?.choices?.[0]?.message?.content;
    let code: string;

    if (typeof codeRaw === "string") {
      code = codeRaw;
    } else if (Array.isArray(codeRaw)) {
      code = codeRaw
        .map((item: any) => ("text" in item ? item.text : ""))
        .join("\n");
    } else {
      code = "";
    }

    console.log("🧾 UPDATED CODE LENGTH:", code?.length);

    if (!code) {
      return NextResponse.json(
        { success: false, error: "AI returned empty code" },
        { status: 500 }
      );
    }

    /* ================= DB UPDATE ================= */
    try {
      await db
        .update(ScreenCongifTable)
        .set({ code })
        .where(
          and(
            eq(ScreenCongifTable.projectId, projectId),
            eq(ScreenCongifTable.screenId, screenId)
          )
        );

      console.log(`✅ Screen updated successfully: ${screenId}`);
    } catch (dbErr) {
      console.error("❌ DB ERROR:", dbErr);
      return NextResponse.json(
        { success: false, error: "Database update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code,
    });

  } catch (error) {
    console.error("❌ UNHANDLED ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}