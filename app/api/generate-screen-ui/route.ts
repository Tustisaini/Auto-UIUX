import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { ScreenConfigTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    const screens = await db
      .select()
      .from(ScreenConfigTable)
      .where(eq(ScreenConfigTable.projectId, projectId));

    if (!screens.length) {
      return NextResponse.json(
        { error: "No screens found" },
        { status: 404 }
      );
    }

    // ✅ PARALLEL GENERATION
    const results = await Promise.all(
      screens.map(async (screen) => {
        try {
          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              },
              body: JSON.stringify({
                model: "stepfun/step-3.5-flash:free",
                messages: [
                  {
                    role: "system",
                    content: `
Return ONLY valid full HTML.
Must start with <html> and end with </html>.
No markdown, no explanation.
                    `,
                  },
                  {
                    role: "user",
                    content: `
Screen Name: ${screen.screenName}
Purpose: ${screen.purpose}
Description: ${screen.screenDescription}

Generate a modern Dribbble-level UI screen.
                    `,
                  },
                ],
              }),
            }
          );

          if (!response.ok) {
            throw new Error("OpenRouter API failed");
          }

          const data = await response.json();

          let html = data?.choices?.[0]?.message?.content || "";
          html = html.replace(/```html|```/g, "").trim();

          const finalHTML =
            html.match(/<html[\s\S]*<\/html>/i)?.[0] ||
            `<html><body><h1>UI Failed</h1></body></html>`;

          const updated = await db
            .update(ScreenConfigTable)
            .set({ code: finalHTML })
            .where(eq(ScreenConfigTable.screenId, screen.screenId))
            .returning();

          return updated[0];
        } catch (err) {
          console.error("Screen generation failed:", err);

          return {
            ...screen,
            code: `<html><body><h1>Generation Failed</h1></body></html>`,
          };
        }
      })
    );

    return NextResponse.json({ screens: results });
  } catch (error) {
    console.error("SCREEN GENERATION ERROR:", error);

    return NextResponse.json(
      { error: "Screen generation failed" },
      { status: 500 }
    );
  }
}