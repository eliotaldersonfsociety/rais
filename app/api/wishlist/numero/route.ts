// pages/api/wishlist/numero/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { wishlist } from '@/lib/wishlist/schema';
import { eq } from 'drizzle-orm';

function log(message: string, data?: any) {
  console.log(`[Wishlist API] ${new Date().toISOString()} - ${message}`, data || '');
}

export async function GET(req: NextRequest) {
  log('--- GET Request Received ---');

  // 1. Autenticación mejorada
  const { userId } = await auth();
  if (!userId) {
    log('Acceso no autorizado: Usuario no identificado');
    return NextResponse.json({ 
      success: false,
      error: 'Autenticación requerida' 
    }, { status: 401 });
  }

  try {
    // 2. Consulta optimizada para administradores
    const wishlists = await db
      .select({
        id: wishlist.id,
        createdAt: wishlist.createdAt
      })
      .from(wishlist)
      .orderBy(wishlist.createdAt);

    // 3. Calcular métricas
    const totalWishlists = wishlists.length;
    const lastWishlistId = wishlists.length > 0 
      ? Math.max(...wishlists.map(w => w.id)) 
      : null;

    log('Datos obtenidos:', { totalWishlists, lastWishlistId });

    // 4. Respuesta estandarizada
    return NextResponse.json({
      success: true,
      data: {
        total: totalWishlists,
        lastId: lastWishlistId,
        wishlists // Opcional: incluir array completo si es necesario
      }
    });

  } catch (error) {
    // 5. Manejo de errores detallado
    log('Error crítico:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
