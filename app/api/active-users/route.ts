import { NextResponse } from "next/server";
import { addActiveUser, getActiveUserCount } from "@/lib/activeUsersStore";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  addActiveUser(sessionId);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const count = getActiveUserCount();
  return NextResponse.json({ activeUsers: count });
}