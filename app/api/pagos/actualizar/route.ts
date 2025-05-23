// app/api/pagos/actualizar-estado/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { transactions } from '@/lib/transaction/schema';
import { orders } from '@/lib/payu/schema';

export async function POST(req: NextRequest) {
  const { id, referenceCode, status, type } = await req.json();
  if ((!id && !referenceCode) || !status || !type) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  try {
    let result;
    if (type === 'saldo') {
      // Actualiza en transactions por id (número)
      result = await db.transactions
        .update(transactions)
        .set({ status })
        .where(eq(transactions.id, Number(id)));
    } else if (type === 'payu') {
      // Actualiza en payu_tab por referenceCode (string)
      result = await db.payu
        .update(orders)
        .set({ status })
        .where(eq(orders.referenceCode, referenceCode));
    } else {
      return NextResponse.json({ error: 'Tipo de compra inválido' }, { status: 400 });
    }

    if (result.rowsAffected > 0) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: 'No se pudo actualizar', detalle: { id, referenceCode, status, type } }, { status: 500 });
    }
  } catch (error) {
    console.error('Error en actualización:', error);
    return NextResponse.json({ error: 'Error en la base de datos', detalle: String(error) }, { status: 500 });
  }
}
