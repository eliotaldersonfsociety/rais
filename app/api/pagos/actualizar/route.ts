// app/api/pagos/actualizar-estado/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { transactions } from '@/lib/transaction/schema'; // Asegúrate que este es el schema correcto

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  try {
    const result = await db.transactions
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id));

    // result es el número de filas afectadas
    if (result.rowsAffected > 0) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
  }
}
