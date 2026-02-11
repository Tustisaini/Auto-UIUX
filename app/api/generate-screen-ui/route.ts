import { openrouter } from "@/config/openrouter";
import { ScreenCongifTable } from "@/config/schema";
import { GENERATE_SCREEN_PROMPT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const {
      projectId,
      screenId,
      screenName,
      purpose,
      screenDescription,
      projectVisualDescription,
    } = await req.json();

    const userInput = `
Screen Name: ${screenName}
Screen Purpose: ${purpose}
Screen Description: ${screenDescription}
Project Visual Description: ${projectVisualDescription}
`;

    const aiResult = await openrouter.chat.send({
      chatGenerationParams: {
        model: "stepfun/step-3.5-flash:free",
        stream: false,
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: GENERATE_SCREEN_PROMPT,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userInput,
              },
            ],
          },
        ],
      },
    });

    const code = aiResult?.choices?.[0]?.message?.content ?? "";

    await db
      .update(ScreenCongifTable)
      .set({
        code: code as string,
      })
      .where(
        and(
          eq(ScreenCongifTable.projectId, projectId),
          eq(ScreenCongifTable.screenId, screenId as string)
        )
      );

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("Error generating screen:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
