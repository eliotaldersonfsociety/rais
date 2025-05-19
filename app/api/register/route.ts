// app/api/register/route.ts
import { NextResponse } from "next/server";
// Asegúrate de que registerSchemaForBackend incluya el campo recaptchaToken
import { registerSchemaForBackend } from "@/lib/validations/registerSchemas";
import bcrypt from "bcryptjs";
// Importa tu configuración del cliente Drizzle
import db from "@/lib/db"; // Asegúrate de que esta ruta sea correcta
// Importa tu esquema Drizzle para la tabla de usuarios
import { users } from "@/lib/register/schema"; // Asegúrate de que esta ruta sea correcta
// Importa funciones de Drizzle para consultas
import { eq } from "drizzle-orm";

// Asegúrate de que tienes tu clave secreta de reCAPTCHA en tus variables de entorno del servidor
// No uses la clave que empieza con NEXT_PUBLIC_, usa la otra clave (la secreta)
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // --- COMIENZO: Validación y Verificación reCAPTCHA ---

    // Asegúrate de que registerSchemaForBackend incluye la validación para recaptchaToken
    const parsed = registerSchemaForBackend.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Extrae los datos validados, incluyendo el token reCAPTCHA
    const { recaptchaToken, ...data } = parsed.data;

    // Verifica si la clave secreta está configurada
    if (!RECAPTCHA_SECRET_KEY) {
        console.error("RECAPTCHA_SECRET_KEY no está configurada en el servidor.");
        return NextResponse.json(
            { error: "Error de configuración del servidor reCAPTCHA." },
            { status: 500 }
        );
    }

    // Realiza la verificación server-side con la API de Google reCAPTCHA
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const verificationResponse = await fetch(verificationUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        // Envía la clave secreta y el token recibido del frontend
        body: new URLSearchParams({
            secret: RECAPTCHA_SECRET_KEY,
            response: recaptchaToken,
        }).toString(),
    });

    const verificationData = await verificationResponse.json();

    // Si Google indica que la verificación falló
    if (!verificationData.success) {
        console.error("reCAPTCHA verification failed:", verificationData);
        // Puedes devolver un mensaje de error específico o genérico
        return NextResponse.json(
            { error: "Verificación reCAPTCHA fallida. Por favor, inténtalo de nuevo." },
            { status: 400 } // O 401/403 dependiendo de tu política
        );
    }

    // Puedes opcionalmente verificar el score para reCAPTCHA v3 si lo estuvieras usando
    // if (verificationData.score < 0.5) { ... }

    // --- FIN: Validación y Verificación reCAPTCHA ---


    // 💧 Usa Drizzle (db3) para verificar si ya existe un usuario con el mismo correo electrónico
    // Este paso se mantiene igual, pero ahora ocurre DESPUÉS de verificar el reCAPTCHA
    const existingUsers = await db.users
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 400 }
      );
    }

    // Hashea la contraseña del usuario (se mantiene igual)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 💧 Usa el método insert de Drizzle para crear el nuevo registro de usuario (se mantiene igual)
    await db.users.insert({
      email: data.email,
      name: data.name,
      lastname: data.lastname,
      address: data.address,
      house_apt: data.house_apt ?? "",
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      phone: data.phone,
      password: hashedPassword,
      country: data.country,
      role: "user",
    });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error: any) {
    console.error("Error durante el registro:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}