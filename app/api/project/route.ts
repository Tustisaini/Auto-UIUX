"use server";

import { db } from "@/config/db";
import { ProjectTable, ScreenCongifTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { openrouter } from "@/config/openrouter";

/* ================================
   🧠 AI PROJECT NAME GENERATOR
================================ */
async function generateProjectName(userInput: string | null | undefined) {
  if (!userInput) return "My App";

  const input = userInput.toLowerCase();

  if (input.includes("education") || input.includes("kids")) return "Kids Learning App";
  if (input.includes("fitness")) return "Fitness Tracker";
  if (input.includes("ecommerce") || input.includes("shop")) return "E-commerce App";
  if (input.includes("dashboard")) return "Analytics Dashboard";
  if (input.includes("chat")) return "Chat Application";

  try {
    const aiResult = await openrouter.chat.send({
      chatGenerationParams: {
        model: "openai/gpt-4o-mini",
        stream: false,
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: "Generate a short, catchy project name (2–4 words), title-cased, no punctuation."
              }
            ]
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Project description: "${userInput}"` }
            ]
          }
        ]
      }
    });

    const content = aiResult?.choices?.[0]?.message?.content;

    let name = "";
    if (typeof content === "string") name = content;
    else if (Array.isArray(content))
      name = content.map((c: any) => c.text || "").join(" ");

    return name.trim().replace(/[^a-zA-Z0-9 ]/g, "") || "Untitled Project";
  } catch (err) {
    console.error("AI name failed:", err);
    return userInput
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
}

/* ================================
   CREATE PROJECT
================================ */
export async function POST(req: NextRequest) {
  try {
    const { userInput, device, projectId } = await req.json();
    const user = await currentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

    const projectName = await generateProjectName(userInput);

    const result = await db.insert(ProjectTable).values({
      projectId,
      userId: user.primaryEmailAddress?.emailAddress as string,
      device,
      userInput,
      projectName,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

/* ================================
   GET PROJECT(S)
================================ */
export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const user = await currentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userEmail = user.primaryEmailAddress?.emailAddress as string;

    // ✅ GET ALL PROJECTS
    if (!projectId) {
      const projects = await db
        .select()
        .from(ProjectTable)
        .where(eq(ProjectTable.userId, userEmail));

      return NextResponse.json({ projects });
    }

    // ✅ GET SINGLE PROJECT
    const project = await db.select().from(ProjectTable)
      .where(and(
        eq(ProjectTable.projectId, projectId),
        eq(ProjectTable.userId, userEmail)
      ))
      .limit(1);

    if (!project.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let projectData = project[0];

    if (!projectData.projectName) {
      const generatedName = await generateProjectName(projectData.userInput);
      const updated = await db.update(ProjectTable)
        .set({ projectName: generatedName })
        .where(eq(ProjectTable.projectId, projectId))
        .returning();

      projectData = updated[0];
    }

    const screens = await db.select().from(ScreenCongifTable)
      .where(eq(ScreenCongifTable.projectId, projectId));

    return NextResponse.json({
      projectDetail: projectData,
      screenConfig: screens,
    });

  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

/* ================================
   UPDATE PROJECT
================================ */
export async function PUT(req: NextRequest) {
  try {
    const { projectName, theme, projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const result = await db.update(ProjectTable)
      .set({ projectName, theme })
      .where(eq(ProjectTable.projectId, projectId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}