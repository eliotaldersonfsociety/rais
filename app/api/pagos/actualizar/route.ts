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
    console.log('Actualizando compra:', { id, status });
    const result = await db.transactions
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, typeof id === 'number' ? id : Number(id))); // fuerza a número si es necesario

    if (result.rowsAffected > 0) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: 'No se pudo actualizar', detalle: { id, status } }, { status: 500 });
    }
  } catch (error) {
    console.error('Error en actualización:', error);
    return NextResponse.json({ error: 'Error en la base de datos', detalle: String(error) }, { status: 500 });
  }
}
