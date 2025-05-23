import { db } from '@/lib/db';
import { orders } from '@/lib/payu/schema';
import { transactions as transactionsTable } from '@/lib/transaction/schema';
import { users as usersTable } from '@/lib/usuarios/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  const type = url.searchParams.get('type') || 'saldo';

  console.log("ID recibido:", id, "Tipo:", type);

  try {
    let purchase: any = null;
    if (type === 'payu') {
      const result = await db.payu
        .select()
        .from(orders)
        .where(eq(orders.referenceCode, id));
      console.log("Resultado PayU:", result);
      purchase = result[0] || null;
    } else {
      if (!id || isNaN(Number(id)) || !isFinite(Number(id))) {
        console.log("ID inválido para saldo:", id);
        return NextResponse.json({ error: 'ID inválido para saldo' }, { status: 400 });
      }
      const result = await db.transactions
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.id, Number(id)));
      console.log("Resultado saldo:", result);
      purchase = result[0] || null;
      if (purchase && purchase.user_id) {
        const user = await db.users
          .select({ email: usersTable.email })
          .from(usersTable)
          .where(eq(usersTable.clerk_id, purchase.user_id));
        purchase.user_email = user[0]?.email || purchase.user_id;
      }
    }
    if (!purchase) {
      console.log("Compra no encontrada");
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ purchase });
  } catch (error) {
    console.error("Error en detalle de compra:", error);
    return NextResponse.json({ error: 'Error al obtener la compra', detalle: String(error) }, { status: 500 });
  }
} 
