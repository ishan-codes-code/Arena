import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(games)
      .orderBy(asc(games.sort_order), asc(games.name));

    return NextResponse.json({ games: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch games." },
      { status: 500 }
    );
  }
}
