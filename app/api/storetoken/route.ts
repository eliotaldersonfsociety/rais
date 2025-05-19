// app/api/payu/store-token/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client/web";

const client = createClient({
  url: process.env.TURSO_DATABASE_AUTH_URL!,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { referenceCode, token } = await req.json();
    
    await client.execute({
      sql: "INSERT INTO payu_tokens (referenceCode, token) VALUES (?, ?)",
      args: [referenceCode, token]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}