import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

/* ================= GET ================= */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = req.nextUrl.searchParams.get("projectId");

    // ALL PROJECTS
    if (!projectId) {
      const projects = await db
        .select()
        .from(ProjectTable)
        .where(eq(ProjectTable.userId, email));

      return NextResponse.json({ projects });
    }

    // SINGLE PROJECT
    const projectRows = await db
      .select()
      .from(ProjectTable)
      .where(
        and(
          eq(ProjectTable.projectId, projectId),
          eq(ProjectTable.userId, email)
        )
      );

    const projectDetail = projectRows[0];

    if (!projectDetail) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const screenConfig = await db
      .select()
      .from(ScreenConfigTable)
      .where(eq(ScreenConfigTable.projectId, projectId));

    return NextResponse.json({
      projectDetail,
      screenConfig,
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

/* ================= SAFE JSON PARSER ================= */
function extractJSON(text: string) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const { userInput, device = "website" } = await req.json();

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userInput) {
      return NextResponse.json(
        { error: "Missing userInput" },
        { status: 400 }
      );
    }

    const projectId = randomUUID();
    let projectName = "Untitled Project";

    /* ===== AI PROJECT NAME ===== */
    try {
      const aiRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content: `You generate ONLY valid JSON. Format: {"projectName":"..."}`,
              },
              {
                role: "user",
                content: `Generate a SaaS project name (max 5 words): ${userInput}`,
              },
            ],
          }),
        }
      );

      const data = await aiRes.json();
      const raw = data?.choices?.[0]?.message?.content || "";
      const parsed = extractJSON(raw);

      if (parsed?.projectName) {
        projectName = parsed.projectName.trim();
      }
    } catch {
      console.log("AI project name fallback used");
    }

    /* ===== CREATE PROJECT ===== */
    await db.insert(ProjectTable).values({
      projectId,
      projectName,
      device,
      userInput,
      userId: email,
      theme: "AURORA_INK",
      projectVisualDescription: userInput,
    });

    /* ===== CREATE SCREENS ===== */
    try {
      const screenRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `
You are a UX architect.

Break the idea into 3–6 screens.

Return ONLY JSON:
{
"screens": [
{
"screenId": "home",
"screenName": "Home",
"purpose": "Landing page",
"screenDescription": "..."
}
]
}
                `,
              },
              {
                role: "user",
                content: userInput,
              },
            ],
          }),
        }
      );

      const screenData = await screenRes.json();
      const rawScreens = screenData?.choices?.[0]?.message?.content || "";
      const parsedScreens = extractJSON(rawScreens);

      if (parsedScreens?.screens?.length) {
        await db.insert(ScreenConfigTable).values(
          parsedScreens.screens.map((s: any) => ({
            projectId,
            screenId: s.screenId,
            screenName: s.screenName,
            purpose: s.purpose,
            screenDescription: s.screenDescription,
            code: "",
          }))
        );
      }
    } catch {
      console.log("Screen generation failed but project still created");
    }

    return NextResponse.json({ projectId });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "create failed" }, { status: 500 });
  }
}

/* ================= PUT ================= */
export async function PUT(req: NextRequest) {
  try {
    const { projectId, projectName } = await req.json();

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    await db
      .update(ProjectTable)
      .set({
        ...(typeof projectName === "string" && projectName.trim()
          ? { projectName: projectName.trim() }
          : {}),
      })
      .where(
        and(
          eq(ProjectTable.projectId, projectId),
          eq(ProjectTable.userId, email)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}