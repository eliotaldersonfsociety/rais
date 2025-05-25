// pages/api/wishlist/numero/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { wishlist, productWishlist } from '@/lib/wishlist/schema';
import { eq, and, count } from 'drizzle-orm';
import { users } from '@/lib/auth/schema';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Verificar si el usuario es admin
    const user = await db.users
      .select()
      .from(users)
      .where(eq(users.clerkId, userId!))
      .get();

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Obtener todas las wishlists con sus productos
    const wishlists = await db.wishlist
      .select({
        id: wishlist.id,
        name: wishlist.name,
        userId: wishlist.userId,
        createdAt: wishlist.createdAt,
        productCount: count(productWishlist.productId)
      })
      .from(wishlist)
      .leftJoin(
        productWishlist,
        eq(wishlist.id, productWishlist.wishlistId)
      )
      .groupBy(wishlist.id)
      .all();

    // Obtener último ID
    const lastWishlistId = wishlists.length > 0 
      ? Math.max(...wishlists.map(w => w.id))
      : 0;

    return NextResponse.json({
      wishlists,
      lastWishlistId,
      total: wishlists.length
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener wishlists' },
      { status: 500 }
    );
  }
}
