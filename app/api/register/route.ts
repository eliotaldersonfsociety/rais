import { NextResponse } from "next/server";
import { registerSchemaForBackend } from "@/lib/validations/registerSchemas";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchemaForBackend.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [data.email],
    });

    if (result.rows.length > 0) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await db.execute({
      sql: `
        INSERT INTO users (
          email, name, lastname, address, house_apt,
          city, state, postal_code, phone, password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        data.email,
        data.name,
        data.lastname,
        data.address,
        data.house_apt ?? "",
        data.city,
        data.state,
        data.postal_code,
        data.phone,
        hashedPassword,
      ],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
