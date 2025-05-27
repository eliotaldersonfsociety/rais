// app/api/process-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/index'; // Drizzle client con múltiples bases de datos
import { orders, orderItems, users } from '@/lib/payu/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { url, items, deliveryInfo } = await req.json();

    if (!url || !items || !deliveryInfo) {
      return NextResponse.json({ error: 'Faltan datos necesarios' }, { status: 400 });
    }

    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());

    const {
      referenceCode,
      TX_VALUE,
      currency,
      buyerEmail,
      authorizationCode,
      transactionState
    } = params;

    if (!authorizationCode || !transactionState) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    const processingDate = Date.now();

    const result = await db.orders.insert(orders).values({
      referenceCode,
      clerk_id: userId || null,
      TX_VALUE: Number(TX_VALUE),
      currency,
      buyerEmail,
      authorizationCode,
      transactionState,
      processingDate,
    });

    const orderId = Number(result.lastInsertRowid);

    const orderItemPromises = items.map((item: any) =>
      db.orders.insert(orderItems).values({
        orderId,
        productId: String(item.id),
        title: JSON.stringify(item),
        price: item.price,
        quantity: item.quantity,
      })
    );
    await Promise.all(orderItemPromises);

    // Verificar y actualizar datos de envío del usuario
    if (userId) {
      const userResult = await db.users
        .select()
        .where(eq(users.clerk_id, userId));
      const user = userResult[0];

      if (user) {
        const envioFields = [
          ['name', 'firstname'],
          ['lastname', 'lastname'],
          ['email', 'email'],
          ['phone', 'phone'],
          ['direction', 'address'],
          ['postalcode', 'postal'],
        ] as const;

        const envioUpdate: Record<string, any> = {};

        for (const [dbField, deliveryField] of envioFields) {
          const currentValue = user[dbField as keyof typeof user];
          const newValue = deliveryInfo[deliveryField];

          if (
            (currentValue === undefined || currentValue === null || currentValue === '') &&
            newValue !== undefined && newValue !== null && newValue !== ''
          ) {
            envioUpdate[dbField] = newValue;
          }
        }

        if (Object.keys(envioUpdate).length > 0) {
          await db.users
            .update(users)
            .set(envioUpdate)
            .where(eq(users.clerk_id, userId));
        }
      }
    }

    return NextResponse.json({ message: 'Pago procesado correctamente' });
  } catch (error: any) {
    console.error('Error procesando el pago:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
