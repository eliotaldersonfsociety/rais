// app/api/payu/get-token/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
// Adjust the import path to point to your db3.ts file
import db3 from "@/lib/db/db3"; // Import the db3 client
import { payuTokens } from "@/lib/payu_token/schema"; // Keep or adjust this path based on where your schema is
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const referenceCode = searchParams.get("referenceCode");

    if (!referenceCode) {
      return NextResponse.json({ error: "Missing referenceCode" }, { status: 400 });
    }

    // 💧 Use the imported db3 client for the query
    const result = await db3
      .select({ token: payuTokens.token })
      .from(payuTokens)
      .where(eq(payuTokens.referenceCode, referenceCode))
      .limit(1); // Limit to 1 as we expect at most one token per referenceCode

    // Drizzle returns an array of results
    if (result.length === 0) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const token = result[0].token; // Access the token from the first (and only) result object

    // 🔐 Decodifica el token en el servidor (jwt part remains the same)
    // Ensure JWT_SECRET is defined and accessible
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    return NextResponse.json({ data: decoded });
  } catch (error: any) {
    console.error("Error processing token:", error); // More general error message
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}