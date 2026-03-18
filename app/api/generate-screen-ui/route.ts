import { openrouter } from "@/config/openrouter";
import { ScreenCongifTable } from "@/config/schema";
import { GENERATE_SCREEN_PROMPT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { projectId, screenId, screenName, purpose, screenDescription, projectVisualDescription } =
      await req.json();

    // ✅ Validate required fields
    if (!projectId || !screenId || !screenName || !purpose) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const userInput = `
Screen Name: ${screenName}
Screen Purpose: ${purpose}
Screen Description: ${screenDescription ?? ""}
Project Visual Description: ${projectVisualDescription ?? ""}
`;

    // ✅ Call AI
    let aiResult;
    try {
      aiResult = await openrouter.chat.send({
        chatGenerationParams: {
          model: "stepfun/step-3.5-flash:free",
          stream: false,
          messages: [
            { role: "system", content: [{ type: "text", text: GENERATE_SCREEN_PROMPT }] },
            { role: "user", content: [{ type: "text", text: userInput }] },
          ],
        },
      });
      console.log("AI Result:", aiResult);
    } catch (aiErr) {
      console.error("AI ERROR:", aiErr);
      return NextResponse.json({ success: false, error: "AI request failed" }, { status: 500 });
    }

    // ✅ Convert AI response to string
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

    if (!code) {
      return NextResponse.json({ success: false, error: "AI returned empty code" }, { status: 500 });
    }

    // ✅ Update DB
    try {
      await db
        .update(ScreenCongifTable)
        .set({ code })
        .where(and(eq(ScreenCongifTable.projectId, projectId), eq(ScreenCongifTable.screenId, screenId)));
      console.log(`Screen code updated for screenId=${screenId}`);
    } catch (dbErr) {
      console.error("DB ERROR:", dbErr);
      return NextResponse.json({ success: false, error: "Database update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}