import { db } from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await currentUser();

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    console.log("User not authenticated or email missing");
    return NextResponse.json(
      { error: "User not authenticated or email missing" },
      { status: 400 }
    );
  }

  const email = user.primaryEmailAddress.emailAddress;

  console.log("Logged in user email:", email);

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  console.log("Users found in DB:", users);

  if (users.length === 0) {
    const data = {
      name: user.fullName ?? "",
      email: email,
    };

    console.log("Inserting user:", data);

    const result = await db
      .insert(usersTable)
      .values(data)
      .returning();

    console.log("Inserted user:", result[0]);

    return NextResponse.json(result[0]);
  }

  console.log("Existing user returned:", users[0]);

  return NextResponse.json(users[0]);
}
