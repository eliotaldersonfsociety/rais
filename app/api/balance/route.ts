import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    // Obtener el saldo actual del usuario desde la tabla users
    const result = await db.execute({
      sql: 'SELECT saldo FROM users WHERE id = ?',
      args: [userId],
    });

    if (!result.rows.length) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const currentSaldo = Number(result.rows[0].saldo);

    return NextResponse.json({ saldo: currentSaldo });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
