// app/api/pagos/todas/[id]/status/route.ts
import { db } from '@/lib/db';
import { orders } from '@/lib/payu/schema';
import { transactions } from '@/lib/transaction/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest) {
  const { status, type } = await req.json();

  // Extrae el id de la URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2]; // .../todas/[id]/status

  if (type === 'payu') {
    await db.payu.update(orders)
      .set({ status })
      .where(eq(orders.referenceCode, id));
  } else {
    await db.transactions.update(transactions)
      .set({ status })
      .where(eq(transactions.id, Number(id)));
  }

  return NextResponse.json({ ok: true });
}
