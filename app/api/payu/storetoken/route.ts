// app/api/payu/store-token/route.ts
import { NextResponse } from "next/server";
// Adjust the import path to point to your db3.ts file
import db3 from "@/lib/db/db3"; // Import the db3 client
// Adjust the import path to your schema file
import { payuTokens } from "@/lib/payu_token/schema"; // Import the table schema

export async function POST(req: Request) {
  try {
    // Parse the request body to get referenceCode and token
    const { referenceCode, token } = await req.json();

    // Basic validation (optional but recommended)
    if (!referenceCode || !token) {
        return NextResponse.json({ error: "Missing referenceCode or token" }, { status: 400 });
    }

    // 💧 Use Drizzle to insert data into the database
    // The insert method takes an object where keys match your schema column names
    await db3.insert(payuTokens).values({
      referenceCode: referenceCode, // Map the received value to the schema column
      token: token, // Map the received value to the schema column
    });

    // Return a success response
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error storing token:", error); // Log the specific error
    // Return an error response with a more informative message if possible,
    // or a generic internal server error.
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
