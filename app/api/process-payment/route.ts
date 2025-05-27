// app/api/process-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/index'; // Drizzle client
import { orders, orderItems, users } from '@/lib/payu/schema'; // Asegúrate de importar la tabla users
import { getAuth } from '@clerk/nextjs/server';
import { eq, isNull } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener datos del usuario desde Clerk
    const { userId } = getAuth(req);

    // 2. Parsear el cuerpo de la solicitud
    const { url, items, deliveryInfo } = await req.json();
    if (!url || !items || !deliveryInfo) {
      return NextResponse.json({ error: 'Faltan datos necesarios' }, { status: 400 });
    }

    // 3. Parsear parámetros de la URL
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

    // 4. Guardar la orden en la base de datos
    const result = await db.transactions.insert(orders).values({
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

    // 5. Guardar los productos asociados a la orden
    const orderItemPromises = items.map((item: any) => {
      return db.transactions.insert(orderItems).values({
        orderId,
        productId: String(item.id),
        title: JSON.stringify(item),
        price: item.price,
        quantity: item.quantity,
      });
    });
    await Promise.all(orderItemPromises);

    // 6. Verificar y actualizar datos de envío del usuario si están vacíos
    if (userId) {
      const user = await db.query.users.findFirst({
        where: eq(users.clerk_id, userId),
      });

      if (user) {
        const updates: Partial<typeof users.$inferInsert> = {};

        if (!user.name && deliveryInfo.firstname) updates.name = deliveryInfo.firstname;
        if (!user.lastname && deliveryInfo.lastname) updates.lastname = deliveryInfo.lastname;
        if (!user.email && deliveryInfo.email) updates.email = deliveryInfo.email;
        if (!user.phone && deliveryInfo.phone) updates.phone = deliveryInfo.phone;
        if (!user.direction && deliveryInfo.address) updates.direction = deliveryInfo.address;
        if (!user.postalcode && deliveryInfo.postal) updates.postalcode = deliveryInfo.postal;

        if (Object.keys(updates).length > 0) {
          await db
            .update(users)
            .set(updates)
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
