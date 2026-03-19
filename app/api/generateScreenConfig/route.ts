import { db } from "@/config/db";
import { openrouter } from "@/config/openrouter";
import { ProjectTable, ScreenCongifTable } from "@/config/schema";
import {
  APP_LAYOUT_CONFIG_PROMPT,
  GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT,
} from "@/data/Prompt";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userInput,
      device = "mobile",
      projectId,
      projectName,
      theme,
      oldScreenDescription,
    } = body;

    if (!projectId) {
      return NextResponse.json({ success: false });
    }

    /* ================= SIMPLE UPDATE ================= */
    if (!userInput) {
      const updateData: any = {};

      if (projectName !== undefined && projectName !== "") {
        updateData.projectName = projectName;
      }

      if (theme !== undefined) {
        updateData.theme = theme;
      }

      if (Object.keys(updateData).length > 0) {
        await db
          .update(ProjectTable)
          .set(updateData)
          .where(eq(ProjectTable.projectId, projectId));
      }

      return NextResponse.json({ success: true });
    }

    /* ================= AI ================= */
    const systemPrompt = oldScreenDescription
      ? GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT
          .replace("{deviceType}", device)
          .replace("{theme}", theme || "AUROR_INK")
      : APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", device);

    const userPrompt = oldScreenDescription
      ? `OLD:\n${oldScreenDescription}\n\nNEW:\n${userInput}`
      : userInput;

    const aiResult = await openrouter.chat.send({
      chatGenerationParams: {
        model: "openai/gpt-4o-mini",
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
    });

    let textContent = aiResult?.choices?.[0]?.message?.content ?? "";

    if (Array.isArray(textContent)) {
      textContent = textContent.map((i: any) => i?.text || "").join("");
    }

    console.log("AI CLEAN TEXT:", textContent);

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);

    let data: any = {};

    try {
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error("JSON parse failed");
    }

    /* ================= UPDATE PROJECT ================= */
    const updateData: any = {
      device,
    };

    if (data?.projectName) {
      updateData.projectName = data.projectName;
    } else if (projectName) {
      updateData.projectName = projectName;
    }

    if (data?.projectVisualDescription) {
      updateData.projectVisualDescription = data.projectVisualDescription;
    }

    if (data?.theme || theme) {
      updateData.theme = data?.theme || theme;
    }

    await db
      .update(ProjectTable)
      .set(updateData)
      .where(eq(ProjectTable.projectId, projectId));

    /* ================= INSERT / UPDATE SCREENS ================= */
    if (Array.isArray(data?.screens)) {
      for (const screen of data.screens) {
        if (!screen?.id) continue;

        const screenName =
          screen.name ||
          screen.screenName ||
          screen.title ||
          "Screen";

        const exists = await db
          .select()
          .from(ScreenCongifTable)
          .where(
            and(
              eq(ScreenCongifTable.projectId, projectId),
              eq(ScreenCongifTable.screenId, screen.id)
            )
          );

        if (exists.length === 0) {
          await db.insert(ScreenCongifTable).values({
            projectId,
            screenId: screen.id,
            screenName,
            purpose: screen.purpose ?? "",
            screenDescription: screen.layoutDescription ?? "",
          });
        } else {
          await db
            .update(ScreenCongifTable)
            .set({
              screenName,
              purpose: screen.purpose ?? "",
              screenDescription: screen.layoutDescription ?? "",
            })
            .where(
              and(
                eq(ScreenCongifTable.projectId, projectId),
                eq(ScreenCongifTable.screenId, screen.id)
              )
            );
        }
      }
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ success: false });
  }
}

/* ================= DELETE ================= */
export async function DELETE(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const screenId = req.nextUrl.searchParams.get("screenId");

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ success: false });
  }

  if (!projectId || !screenId) {
    return NextResponse.json({ success: false });
  }

  await db
    .delete(ScreenCongifTable)
    .where(
      and(
        eq(ScreenCongifTable.projectId, projectId),
        eq(ScreenCongifTable.screenId, screenId)
      )
    );

  return NextResponse.json({ success: true });
}