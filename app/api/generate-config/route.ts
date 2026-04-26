import { db } from "@/config/db";
import { openrouter } from "@/config/openrouter";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

function safeJSONParse(text: string) {
  try {
    const cleaned = text
      .replace(/```json|```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userInput, deviceType, projectId } = await req.json();

    if (!projectId || !userInput) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. AI CONFIG GENERATION
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

    const content = aiResult?.choices?.[0]?.message?.content;

    const textContent =
      typeof content === "string"
        ? content
        : Array.isArray(content)
        ? content.map((c: any) => c?.text || "").join("")
        : "";

    const json = safeJSONParse(textContent);

    if (!json) {
      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 500 }
      );
    }

    // 2. UPDATE PROJECT (SAFE)
    await db
      .update(ProjectTable)
      .set({
        projectName: json.projectName || "Untitled Project",
        projectVisualDescription: json.projectVisualDescription || "",
        theme: json.theme || "AURORA_INK",
      })
      .where(eq(ProjectTable.projectId, projectId));

    // 3. DELETE OLD SCREENS
    await db
      .delete(ScreenConfigTable)
      .where(eq(ScreenConfigTable.projectId, projectId));

    // 4. INSERT SCREEN METADATA ONLY
    const insertedScreens = [];

    for (const screen of json?.screens || []) {
      const inserted = await db
        .insert(ScreenConfigTable)
        .values({
          projectId,
          screenId: screen.id || randomUUID(),
          screenName: screen.name || "Screen",
          purpose: screen.purpose || "",
          screenDescription: screen.layoutDescription || "",
          code: null,
        })
        .returning();

      insertedScreens.push(inserted[0]);
    }

    return NextResponse.json({
      projectId,
      screens: insertedScreens,
    });
  } catch (error) {
    console.error("CONFIG ERROR:", error);
    return NextResponse.json(
      { error: "Failed config generation" },
      { status: 500 }
    );
  }
}