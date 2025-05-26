// app/api/generatetoken/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { payuTokens } from '@/lib/payu_token/schema';

// Validación de variables de entorno
const secretJwt = process.env.JWT_SECRET;
const apiKey = process.env.NEXT_PUBLIC_PAYU_API_KEY;
const merchantId = process.env.NEXT_PUBLIC_PAYU_MERCHANT_ID;
const accountId = process.env.NEXT_PUBLIC_PAYU_ACCOUNT_ID;

// Verificación de variables requeridas
if (!secretJwt || !apiKey || !merchantId || !accountId) {
  console.error('Error: Faltan variables de entorno requeridas:', {
    secretJwt: !!secretJwt,
    apiKey: !!apiKey,
    merchantId: !!merchantId,
    accountId: !!accountId
  });
}

export async function POST(req: NextRequest) {
  try {
    // Verificar que todas las variables de entorno estén disponibles
    if (!secretJwt || !apiKey || !merchantId || !accountId) {
      return NextResponse.json(
        { error: 'Error de configuración: Faltan variables de entorno requeridas' },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Validación de campos requeridos
    const requiredFields = ['referenceCode', 'amount', 'currency', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const {
      referenceCode,
      amount,
      currency,
      description,
      responseUrl,
      confirmationUrl,
      buyerEmail,
      buyerFullName,
      telephone,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingState,
      postalCode,
    } = body;

    // Validación adicional de datos
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      );
    }

    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
      return NextResponse.json(
        { error: 'Moneda inválida' },
        { status: 400 }
      );
    }

    try {
      // 1) Genera el JWT para tracking
      const token = jwt.sign(
        { referenceCode, amount, currency },
        secretJwt,
        { expiresIn: '1h' }
      );

      // 2) Calcula la firma MD5 para PayU
      const signatureString = [apiKey, merchantId, referenceCode, amount, currency].join('~');
      const signature = crypto.createHash('md5').update(signatureString).digest('hex');

      // 3) Guarda el token en la base de datos
      await db.payu.insert(payuTokens).values({
        referenceCode,
        token,
        createdAt: new Date().toISOString(),
      });

      // 4) Devuelve la respuesta con todos los campos necesarios
      return NextResponse.json({
        success: true,
        merchantId,
        accountId,
        referenceCode,
        amount,
        currency,
        signature,
        description,
        responseUrl,
        confirmationUrl,
        buyerEmail,
        buyerFullName,
        telephone,
        shippingAddress,
        shippingCity,
        shippingCountry,
        shippingState,
        postalCode,
      });
    } catch (error) {
      console.error('Error procesando el pago:', error);
      return NextResponse.json(
        { error: 'Error procesando el pago', details: error instanceof Error ? error.message : 'Error desconocido' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Error parseando la solicitud:', err);
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
