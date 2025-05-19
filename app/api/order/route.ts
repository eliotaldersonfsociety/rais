import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { z } from 'zod';

const turso = createClient({
  url: process.env.TURSO_DATABASE_AUTH_URL!,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validación con Zod
    const orderSchema = z.object({
      userId: z.string().min(1),
      total: z.number().nonnegative(),
      items: z.array(z.any()),
      shippingAddress: z.object({}).passthrough(), // Puedes definir el shape si lo conoces
      status: z.string().min(1),
      referenceCode: z.string().min(1),
    });
    const parseResult = orderSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Datos inválidos en la orden', detalles: parseResult.error.errors }, { status: 400 });
    }
    const { userId, total, items, shippingAddress, status, referenceCode } = parseResult.data;

    const result = await turso.execute({
      sql: `
        INSERT INTO orders (
          user_id, total, items, shipping_address, status, reference_code
        ) VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        userId,
        total,
        JSON.stringify(items),
        JSON.stringify(shippingAddress),
        status,
        referenceCode, // usar el del frontend
      ],
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error al guardar el pedido:", error);
    return NextResponse.json({ message: "Error al guardar el pedido" }, { status: 500 });
  }
}
