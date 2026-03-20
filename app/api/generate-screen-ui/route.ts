"use server";

import { openrouter } from "@/config/openrouter";
import { ScreenCongifTable } from "@/config/schema"; // Fixed typo
import { GENERATE_SCREEN_PROMPT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming request body:", body);

    const { projectId, screenId, screenName, purpose, screenDescription, projectVisualDescription } = body;

    if (!projectId || !screenId || !screenName || !purpose) {
      console.warn("Missing required fields:", { projectId, screenId, screenName, purpose });
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const userInput = `
Screen Name: ${screenName}
Screen Purpose: ${purpose}
Screen Description: ${screenDescription ?? ""}
Project Visual Description: ${projectVisualDescription ?? ""}
`;

    // --- Call AI ---
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
      console.log("AI Result received:", aiResult);
    } catch (err) {
      console.error("AI ERROR:", err);
      return NextResponse.json({ success: false, error: "AI request failed" }, { status: 500 });
    }

    // --- Extract code safely ---
    let codeRaw = aiResult?.choices?.[0]?.message?.content;
    let code: string = "";

    if (typeof codeRaw === "string") code = codeRaw;
    else if (Array.isArray(codeRaw)) code = codeRaw.map((item: any) => item?.text || "").join("\n");
    else code = "// AI returned empty content";

    // --- Upsert screen code in DB ---
    try {
      const existing = await db.select().from(ScreenCongifTable)
        .where(and(eq(ScreenCongifTable.projectId, projectId), eq(ScreenCongifTable.screenId, screenId)));

      console.log("Existing DB record:", existing);

      if (existing.length === 0) {
        await db.insert(ScreenCongifTable).values({
          projectId,
          screenId,
          screenName,
          purpose,
          screenDescription: screenDescription ?? "",
          code,
        });
        console.log("Inserted new screen record.");
      } else {
        await db.update(ScreenCongifTable)
          .set({ code, screenName, purpose, screenDescription: screenDescription ?? "" })
          .where(and(eq(ScreenCongifTable.projectId, projectId), eq(ScreenCongifTable.screenId, screenId)));
        console.log("Updated existing screen record.");
      }
    } catch (dbErr) {
      console.error("DB ERROR:", dbErr);
      return NextResponse.json({ success: false, error: "Database operation failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}