import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { z } from 'zod';

const db = createClient({
  url: process.env.TURSO_DATABASE_AUTH_URL!,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
});

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Método no permitido" }, { status: 405 });
  }

  // Validación con Zod
  const tokenSchema = z.object({
    token: z.string().min(1, 'El token es obligatorio'),
  });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parseResult = tokenSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: "El token es obligatorio y debe ser un string" }, { status: 400 });
  }

  console.log("Body recibido:", body);

  const urlObj = new URL(body.token);
  const params = Object.fromEntries(urlObj.searchParams.entries());

  console.log("Parámetros extraídos:", params);

  const {
    merchantId,
    merchant_name,
    merchant_address,
    telephone,
    merchant_url,
    transactionState,
    lapTransactionState,
    message,
    referenceCode,
    reference_pol,
    transactionId,
    description,
    trazabilityCode,
    cus,
    orderLanguage,
    polTransactionState,
    signature,
    polResponseCode,
    lapResponseCode,
    risk,
    polPaymentMethod,
    lapPaymentMethod,
    polPaymentMethodType,
    lapPaymentMethodType,
    installmentsNumber,
    TX_VALUE,
    TX_TAX,
    currency,
    lng,
    buyerEmail,
    authorizationCode,
    TX_ADMINISTRATIVE_FEE,
    TX_TAX_ADMINISTRATIVE_FEE,
    TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE,
    processingDate
  } = params;

  console.log("Valores desestructurados:", {
    merchantId,
    merchant_name,
    merchant_address,
    telephone,
    merchant_url,
    transactionState,
    lapTransactionState,
    message,
    referenceCode,
    reference_pol,
    transactionId,
    description,
    trazabilityCode,
    cus,
    orderLanguage,
    polTransactionState,
    signature,
    polResponseCode,
    lapResponseCode,
    risk,
    polPaymentMethod,
    lapPaymentMethod,
    polPaymentMethodType,
    lapPaymentMethodType,
    installmentsNumber,
    TX_VALUE,
    TX_TAX,
    currency,
    lng,
    buyerEmail,
    authorizationCode,
    TX_ADMINISTRATIVE_FEE,
    TX_TAX_ADMINISTRATIVE_FEE,
    TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE,
    processingDate
  });

  if (!body.token) {
    return NextResponse.json({ error: "El token es obligatorio" }, { status: 400 });
  }

  try {
    // Convertir valores a los tipos correctos
    const parsedInstallmentsNumber = installmentsNumber ? parseInt(installmentsNumber, 10) : null;
    const parsedTX_VALUE = TX_VALUE ? parseFloat(TX_VALUE) : null;
    const parsedTX_TAX = TX_TAX ? parseFloat(TX_TAX) : null;
    const parsedTX_ADMINISTRATIVE_FEE = TX_ADMINISTRATIVE_FEE ? parseFloat(TX_ADMINISTRATIVE_FEE) : null;
    const parsedTX_TAX_ADMINISTRATIVE_FEE = TX_TAX_ADMINISTRATIVE_FEE ? parseFloat(TX_TAX_ADMINISTRATIVE_FEE) : null;
    const parsedTX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE = TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE ? parseFloat(TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE) : null;

    console.log("Valores convertidos:", {
      parsedInstallmentsNumber,
      parsedTX_VALUE,
      parsedTX_TAX,
      parsedTX_ADMINISTRATIVE_FEE,
      parsedTX_TAX_ADMINISTRATIVE_FEE,
      parsedTX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE
    });

    const sql = `
      INSERT INTO payus (
        token, merchantId, merchant_name, merchant_address, telephone, merchant_url,
        transactionState, lapTransactionState, message, referenceCode, reference_pol,
        transactionId, description, trazabilityCode, cus, orderLanguage,
        polTransactionState, signature, polResponseCode, lapResponseCode, risk,
        polPaymentMethod, lapPaymentMethod, polPaymentMethodType, lapPaymentMethodType,
        installmentsNumber, TX_VALUE, TX_TAX, currency, lng, buyerEmail,
        authorizationCode, TX_ADMINISTRATIVE_FEE, TX_TAX_ADMINISTRATIVE_FEE,
        TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE, processingDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      body.token, merchantId, merchant_name, merchant_address, telephone, merchant_url,
      transactionState, lapTransactionState, message, referenceCode, reference_pol,
      transactionId, description, trazabilityCode, cus, orderLanguage,
      polTransactionState, signature, polResponseCode, lapResponseCode, risk,
      polPaymentMethod, lapPaymentMethod, polPaymentMethodType, lapPaymentMethodType,
      parsedInstallmentsNumber, parsedTX_VALUE, parsedTX_TAX, currency, lng, buyerEmail,
      authorizationCode, parsedTX_ADMINISTRATIVE_FEE, parsedTX_TAX_ADMINISTRATIVE_FEE,
      parsedTX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE, processingDate
    ];

    // Verificar que el número de valores coincida con el número de columnas
    const columnCount = sql.split('?').length - 1;
    if (values.length !== columnCount) {
      console.error(`Error: Número de valores (${values.length}) no coincide con el número de columnas (${columnCount})`);
      return NextResponse.json({ error: "Error interno del servidor: Número de valores no coincide con el número de columnas" }, { status: 500 });
    }

    await db.execute(sql, values);

    return NextResponse.json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error guardando datos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
