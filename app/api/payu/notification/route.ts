import { NextRequest, NextResponse } from 'next/server';
import db3 from '@/lib/db/db3'; // Ajusta si está en otro path
import { orders } from '@/lib/payu/fsd/'; // Tu tabla de órdenes

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData(); // PayU envía datos como x-www-form-urlencoded
    const data = Object.fromEntries(body.entries());

    const {
      reference_sale, // Este es tu referenceCode que usas para identificar el pedido
      state_pol, // Estado numérico
      response_message_pol, // Mensaje textual del estado
      transaction_id,
    } = data;

    if (!reference_sale || !state_pol || !transaction_id) {
      return NextResponse.json({ error: "Datos faltantes en la notificación" }, { status: 400 });
    }

    // Convertir a string por seguridad
    const ref = reference_sale.toString();
    const estado = state_pol.toString();
    const mensaje = response_message_pol?.toString();

    // Actualizar el estado en la tabla de órdenes
    await db3
      .update(orders)
      .set({
        polTransactionState: estado,
        message: mensaje || 'Sin mensaje',
        transactionId: transaction_id.toString(),
      })
      .where(orders.referenceCode.eq(ref));

    return NextResponse.json({ message: "Notificación recibida y procesada correctamente" });
  } catch (error: any) {
    console.error("Error procesando la notificación de PayU:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
