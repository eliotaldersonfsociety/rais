// app/api/pagos/actualizar-estado/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { transactions } from '@/lib/transaction/schema'; //k
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
      // Haz un select del registro actualizado
      const updated = await db.transactions
        .select()
        .from(transactions)
        .where(eq(transactions.id, Number(id)));
      return NextResponse.json({ ok: true, updated });
    } else if (type === 'payu') {
      // Actualiza en payu_tab por referenceCode (string)
      result = await db.payu
        .update(orders)
        .set({ status })
        .where(eq(orders.referenceCode, referenceCode));
      // Haz un select del registro actualizado
      const updated = await db.payu
        .select()
        .from(orders)
        .where(eq(orders.referenceCode, referenceCode));
      return NextResponse.json({ ok: true, updated });
    } else {
      return NextResponse.json({ error: 'Tipo de compra inválido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en actualización:', error);
    return NextResponse.json({ error: 'Error en la base de datos', detalle: String(error) }, { status: 500 });
  }
}
