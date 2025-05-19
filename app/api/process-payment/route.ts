// app/api/process-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/index'; // Drizzle client
import { orders, orderItems } from '@/lib/payu/schema'; // Drizzle schema
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener datos del usuario desde Clerk
    const { userId } = getAuth(req);

    // 2. Parsear el cuerpo de la solicitud
    const { url, items } = await req.json();
    if (!url || !items) {
      console.log("Faltan url o items en el body:", { url, items });
      return NextResponse.json({ error: 'URL y productos son necesarios' }, { status: 400 });
    }

    // 3. Parsear parámetros de la URL
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());
    console.log("Parámetros extraídos de la URL:", params);

    // 4. Desestructuración de parámetros (sin processingDate)
    const {
      referenceCode,
      TX_VALUE,
      currency,
      buyerEmail,
      authorizationCode,
      transactionState
    } = params;

    // Log de los valores a insertar
    console.log("Valores a insertar en la orden:", {
      referenceCode, TX_VALUE, currency, buyerEmail, authorizationCode, transactionState
    });

    if (!authorizationCode || !transactionState) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    // Genera el timestamp en el backend
    const processingDate = Date.now();

    // 5. Guardar la orden en la base de datos
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

    console.log("Resultado del insert:", result);

    const orderId = result.lastInsertRowid as number;
    console.log("ID de la orden insertada:", orderId);

    // 6. Guardar los productos asociados a la orden
    const orderItemPromises = items.map((item: any) => {
      console.log("Insertando item:", item);
      return db.transactions.insert(orderItems).values({
        orderId,
        productId: String(item.id),
        title: JSON.stringify(item),
        price: item.price,
        quantity: item.quantity,
      });
    });

    await Promise.all(orderItemPromises);

    // 7. Responder con éxito
    return NextResponse.json({ message: 'Pago procesado correctamente' });
  } catch (error: any) {
    console.error('Error procesando el pago:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
