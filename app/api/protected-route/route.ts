// app/api/protected-route/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Ajusta la ruta según donde definiste tu authOptions
import { NextResponse } from "next/server";

interface CustomUser {
  // ...otros campos...
  role: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({ message: "Acceso permitido", user: session.user });
}
