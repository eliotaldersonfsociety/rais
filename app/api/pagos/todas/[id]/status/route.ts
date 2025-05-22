// app/api/pagos/todas/[id]/status/route.ts
import { db } from '@/lib/db';
import { orders } from '@/lib/payu/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest) {
  const { status } = await req.json();

  // Extrae el id de la URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2]; // .../todas/[id]/status

  // Solo actualiza en la tabla de PayU (payu_tab)
  await db.transactions.update(orders)
    .set({ status })
    .where(eq(orders.referenceCode, id));

  return NextResponse.json({ ok: true });
}
