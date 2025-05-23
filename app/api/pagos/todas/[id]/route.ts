import { db } from '@/lib/db';
import { orders } from '@/lib/payu/schema';
import { transactions as transactionsTable } from '@/lib/transaction/schema';
import { users as usersTable } from '@/lib/usuarios/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Extrae el id de la URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 2]; // .../todas/[id]/route.ts

  const type = url.searchParams.get('type') || 'saldo';

  try {
    let purchase: any = null;
    if (type === 'payu') {
      // Busca por referenceCode en la tabla de PayU
      const result = await db.payu
        .select()
        .from(orders)
        .where(eq(orders.referenceCode, id));
      purchase = result[0] || null;
    } else {
      // Busca por id en la tabla de saldo
      const result = await db.transactions
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.id, Number(id)));
      purchase = result[0] || null;
      // Si existe, busca el email del usuario
      if (purchase && purchase.user_id) {
        const user = await db.users
          .select({ email: usersTable.email })
          .from(usersTable)
          .where(eq(usersTable.clerk_id, purchase.user_id));
        purchase.user_email = user[0]?.email || purchase.user_id;
      }
    }
    if (!purchase) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ purchase });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la compra', detalle: String(error) }, { status: 500 });
  }
}
