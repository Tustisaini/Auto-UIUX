import { db } from "@/config/db";
import { ProjectTable, ScreenCongifTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";



/* ================================
   CREATE PROJECT
================================ */
export async function POST(req: NextRequest) {
  try {
    const { userInput, device, projectId } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(ProjectTable)
      .values({
        projectId,
        userId: user.primaryEmailAddress?.emailAddress as string,
        device,
        userInput,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}



/* ================================
   GET PROJECT (SECURE)
================================ */
export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify project ownership
    const project = await db
      .select()
      .from(ProjectTable)
      .where(
        and(
          eq(ProjectTable.projectId, projectId),
          eq(
            ProjectTable.userId,
            user.primaryEmailAddress?.emailAddress as string
          )
        )
      )
      .limit(1);

    if (!project.length) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Fetch screens ONLY after ownership confirmed
    const screens = await db
      .select()
      .from(ScreenCongifTable)
      .where(eq(ScreenCongifTable.projectId, projectId));

    return NextResponse.json({
      projectDetail: project[0],
      screenConfig: screens,
    });

  } catch (error) {
    console.error("GET /api/project error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
