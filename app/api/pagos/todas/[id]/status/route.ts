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

  console.log("PATCH recibido:", { id, status, type }); // ojo

  let result;
  if (type === 'payu') {
    console.log("Actualizando payu_tab con referenceCode:", id);
    result = await db.payu.update(orders)
      .set({ status })
      .where(eq(orders.referenceCode, id));
    console.log("Resultado update payu_tab:", result);
  } else {
    console.log("Actualizando transactions con id:", id);
    result = await db.transactions.update(transactions)
      .set({ status })
      .where(eq(transactions.id, Number(id)));
    console.log("Resultado update transactions:", result);
  }

  // Verifica que el estado se haya actualizado correctamente en la base de datos
  let updatedStatus;
  if (type === 'payu') {
    const updatedOrder = await db.payu.select().from(orders).where(eq(orders.referenceCode, id));
    updatedStatus = updatedOrder[0]?.status;
  } else {
    const updatedTransaction = await db.transactions.select().from(transactions).where(eq(transactions.id, Number(id)));
    updatedStatus = updatedTransaction[0]?.status;
  }

  console.log("Estado actualizado en la base de datos:", updatedStatus);

  return NextResponse.json({ ok: true, result, updatedStatus });
}
