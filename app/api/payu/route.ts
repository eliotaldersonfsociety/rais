// app/api/process-payment/route.ts // Assuming this is the file name
import { NextRequest, NextResponse } from 'next/server';
// Import your Drizzle client setup
import db3 from "@/lib/db/db3"; // Adjust the path if your db3.ts is elsewhere
// Import your Drizzle schema for the orders table
import { orders } from "@/lib/payu/fsd/"; // Adjust the path if your schema.ts is elsewhere
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  // Next.js Route Handlers automatically handle method checks,
  // but keeping this explicit check is also fine if you prefer.
  // if (req.method !== "POST") {
  //   return NextResponse.json({ error: "Método no permitido" }, { status: 405 });
  // }

  try {
    // 1. Obtener usuario Clerk
    const { userId } = getAuth(req);

    // 2. Parsear el body
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "La URL es obligatoria" }, { status: 400 });
    }

    // 3. Parsear los parámetros de la URL
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());

    // 4. Desestructurar los parámetros (igual que antes)
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
      polPaymentMethod, // These might be strings from URL, need conversion
      lapPaymentMethod, // These might be strings from URL, need conversion
      polPaymentMethodType, // These might be strings from URL, need conversion
      lapPaymentMethodType, // These might be strings from URL, need conversion
      installmentsNumber, // These might be strings from URL, need conversion
      TX_VALUE, // These might be strings from URL, need conversion
      TX_TAX, // These might be strings from URL, need conversion
      currency,
      lng,
      buyerEmail,
      authorizationCode,
      TX_ADMINISTRATIVE_FEE, // These might be strings from URL, need conversion
      TX_TAX_ADMINISTRATIVE_FEE, // These might be strings from URL, need conversion
      TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE, // These might be strings from URL, need conversion
      processingDate // Ensure format matches schema (text or timestamp)
    } = params;

    // 💧 Use Drizzle's insert method to save the data into the 'orders' table
    // The .values() method expects an object where keys match the column names
    // defined in your 'orders' schema.
    await db3.insert(orders).values({
      clerk_id: userId || null,
      merchantId: merchantId,
      merchant_name: merchant_name,
      merchant_address: merchant_address,
      telephone: telephone,
      merchant_url: merchant_url,
      transactionState: transactionState,
      lapTransactionState: lapTransactionState,
      message: message,
      referenceCode: referenceCode, // Assuming this is required and unique per schema
      reference_pol: reference_pol,
      transactionId: transactionId,
      description: description,
      trazabilityCode: trazabilityCode,
      cus: cus,
      orderLanguage: orderLanguage,
      polTransactionState: polTransactionState,
      signature: signature,
      polResponseCode: polResponseCode,
      lapResponseCode: lapResponseCode,
      risk: risk,
      // Convert string parameters to numbers if your schema defines them as integers or reals.
      // Use parseInt for integers, parseFloat for real/decimal numbers.
      // Include checks for existence before conversion to avoid errors on missing params.
      polPaymentMethod: polPaymentMethod ? parseInt(polPaymentMethod) : null,
      lapPaymentMethod: lapPaymentMethod ? parseInt(lapPaymentMethod) : null,
      polPaymentMethodType: polPaymentMethodType ? parseInt(polPaymentMethodType) : null,
      lapPaymentMethodType: lapPaymentMethodType ? parseInt(lapPaymentMethodType) : null,
      installmentsNumber: installmentsNumber ? parseInt(installmentsNumber) : null,
      TX_VALUE: TX_VALUE ? parseFloat(TX_VALUE) : null,
      TX_TAX: TX_TAX ? parseFloat(TX_TAX) : null,
      currency: currency,
      lng: lng,
      buyerEmail: buyerEmail,
      authorizationCode: authorizationCode,
      TX_ADMINISTRATIVE_FEE: TX_ADMINISTRATIVE_FEE ? parseFloat(TX_ADMINISTRATIVE_FEE) : null,
      TX_TAX_ADMINISTRATIVE_FEE: TX_TAX_ADMINISTRATIVE_FEE ? parseFloat(TX_TAX_ADMINISTRATIVE_FEE) : null,
      TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE: TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE ? parseFloat(TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE) : null,
      processingDate: processingDate, // Ensure the format matches your schema (e.g., TEXT or INTEGER timestamp)
    });

    // Return a success response
    return NextResponse.json({ message: "Datos guardados correctamente" });

  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error guardando datos:", error);
    // Return an error response. Include the error message if available for more detail.
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
