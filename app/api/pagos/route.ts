import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import db from '@/lib/db'; // Primera base de datos (usuarios)
import db2 from '@/lib/db/db2'; // Segunda base de datos (compras)

export async function POST(req) {
  const token = await getToken({ req });

  if (!token || !token.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json();
  const { subtotal, tip, shipping, taxes, total, productos, type = "saldo" } = body;

  if (!total || total <= 0) {
    return NextResponse.json({ error: 'Total inválido' }, { status: 400 });
  }

  // Obtener el saldo actual del usuario desde la tabla users
  const result = await db.execute({
    sql: 'SELECT saldo FROM users WHERE id = ?',
    args: [token.id],
  });

  if (!result.rows.length) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const currentSaldo = Number(result.rows[0].saldo);

  if (currentSaldo < total) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
  }

  const newSaldo = currentSaldo - total;
  console.log('Nuevo saldo:', newSaldo);

  // Actualizar el saldo en la tabla users
  await db.execute({
    sql: 'UPDATE users SET saldo = ? WHERE id = ?',
    args: [newSaldo, token.id],
  });

  // Registrar la compra en la tabla de la segunda base de datos
  try {
    const purchaseResult = await db2.execute({
      sql: `
        INSERT INTO transactions (user_id, amount, type, description, subtotal, tip, shipping, taxes, total, products)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        token.id,
        total,
        type,
        "Compra de productos", // Descripción general
        subtotal,
        tip || 0,
        shipping || "GRATIS", // Si no hay costo de envío, ponemos "GRATIS"
        taxes,
        total,
        JSON.stringify(productos), // Guardamos los productos como un JSON
      ],
    });

    if (!purchaseResult) {
      throw new Error('Error al registrar la compra');
    }

    return NextResponse.json({ success: true, newSaldo, purchaseId: purchaseResult.insertId });
  } catch (error) {
    console.error('Error al registrar la compra:', error);
    return NextResponse.json({ error: 'Error al registrar la compra' }, { status: 500 });
  }
}
