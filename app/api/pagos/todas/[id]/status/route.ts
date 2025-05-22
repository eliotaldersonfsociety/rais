// app/api/pagos/todas/[id]/status/route.ts
import { db } from '@/lib/db';
import { orders } from '@/lib/payu/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { status } = await req.json();

  // Solo actualiza en la tabla de PayU (payu_tab)
  await db.transactions.update(orders)
    .set({ transactionState: status })
    .where(eq(orders.referenceCode, context.params.id));

  return NextResponse.json({ ok: true });
}
