import { NextResponse } from "next/server";
import db from "@/lib/db/db2"; // ajusta esto según tu proyecto

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId es requerido" },
        { status: 400 }
      );
    }

    // Obtener la última orden del usuario
    const result = await db.execute(
      `SELECT id FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    const order = result.rows?.[0];

    if (!order) {
      return NextResponse.json(
        { message: "No se encontró ninguna orden para este usuario" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: order.id,
    });
  } catch (error) {
    console.error("Error al obtener la orden:", error);
    return NextResponse.json(
      { message: "Error al obtener la orden" },
      { status: 500 }
    );
  }
}
