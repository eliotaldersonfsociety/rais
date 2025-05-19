import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { transactions as transactionsTable, ProductItem } from '@/lib/transaction/schema';
import { orders } from '@/lib/payu/fsd/';
import { eq, desc, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

interface Token {
  id: string;
}

interface PayUTransaction {
  referenceCode: string | null;
  TX_VALUE: number | null;
  description: string | null;
  processingDate: string | null;
  TX_TAX: number | null;
  transactionState: string | null;
  polPaymentMethod: number | null;
  authorizationCode: string | null;
  buyerEmail: string | null;
}

interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string | number;
  products: string | ProductItem[];
  subtotal: number;
  tip: number;
  shipping: string;
  taxes: number;
  total: number;
}

interface Purchase {
  id: string | number;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: number;
  products: string;
  subtotal: number;
  tip: number;
  shipping: string;
  taxes: number;
  total: number;
  customer?: {
    name: string | null;
    email: string | null;
    address: string | null;
    house_apt: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    phone: string | null;
  };
}

export async function GET(req: Request): Promise<Response> {
  try {
    console.log('=== Iniciando solicitud de pagos ===');
    
    // Obtener parámetros de la URL
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const type = url.searchParams.get('type') || 'saldo';
    const limit = 10;
    const offset = (page - 1) * limit;

    console.log('Parámetros de solicitud:', { page, type, limit, offset });

    // Verificar autenticación
    let token: Token | null = null;
    let session: any = null;

    try {
      [token, session] = await Promise.all([
        getToken({ req: req as any }),
        getServerSession(authOptions)
      ]);
    } catch (authError: any) {
      console.error('Error en la autenticación:', authError);
      return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
    }

    if (!token?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId: string = token.id;

    try {
      // Obtener transacciones según el tipo
      let transactions;
      let totalCount = 0;

      if (type === 'payu') {
        // Obtener total de transacciones PayU
        const payuTransactions = await db.payu
          .select({
            id: orders.referenceCode,
            user_id: orders.buyerEmail,
            amount: orders.TX_VALUE,
            type: sql<string>`'CARD'`,
            description: orders.description,
            created_at: orders.processingDate,
            products: sql<string>`json_array(json_object(
              'name', ${orders.description},
              'price', ${orders.TX_VALUE},
              'quantity', 1
            ))`,
            subtotal: sql<number>`${orders.TX_VALUE} - ${orders.TX_TAX}`,
            tip: sql<number>`0`,
            shipping: sql<string>`'Gratis'`,
            taxes: orders.TX_TAX,
            total: orders.TX_VALUE
          })
          .from(orders)
          .orderBy(desc(orders.processingDate))
          .prepare();

        const results = await payuTransactions.execute();
        totalCount = results.length;
        transactions = results.slice(offset, offset + limit);

      } else {
        // Obtener total de transacciones regulares
        const regularTransactions = await db.transactions
          .select()
          .from(transactionsTable)
          .orderBy(desc(transactionsTable.created_at))
          .prepare();

        const results = await regularTransactions.execute();
        
        // Ordenar los resultados por fecha de creación (más recientes primero)
        const sortedResults = (results as Transaction[]).sort((a, b) => {
          const dateA = typeof a.created_at === 'string' ? 
            new Date(a.created_at).getTime() : 
            Number(a.created_at);
          const dateB = typeof b.created_at === 'string' ? 
            new Date(b.created_at).getTime() : 
            Number(b.created_at);
          return dateB - dateA;
        });

        totalCount = sortedResults.length;
        
        // Aplicar paginación después de ordenar
        transactions = sortedResults
          .slice(offset, offset + limit)
          .map(tx => {
            let parsedProducts: ProductItem[];
            try {
              parsedProducts = typeof tx.products === 'string' ? 
                JSON.parse(tx.products.replace(/\n/g, '').trim()) : 
                tx.products as ProductItem[];
            } catch (error) {
              console.error('Error parsing products:', error);
              parsedProducts = [{
                name: tx.description || 'Producto sin nombre',
                price: tx.total || 0,
                quantity: 1
              }];
            }
            return {
              ...tx,
              products: parsedProducts
            };
          });
      }

      // Agregar datos del usuario a las transacciones
      const purchasesWithUserData = transactions.map(purchase => ({
        ...purchase,
        customer: {
          name: session.user.name || null,
          email: session.user.email || null,
          address: (session.user as any).address || null,
          house_apt: (session.user as any).house_apt || null,
          city: (session.user as any).city || null,
          state: (session.user as any).state || null,
          postal_code: (session.user as any).postal_code || null,
          phone: (session.user as any).phone || null
        }
      }));

      return NextResponse.json({
        purchases: purchasesWithUserData,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          currentPage: page,
          hasMore: offset + transactions.length < totalCount
        }
      });

    } catch (dbError: any) {
      console.error('Error en operaciones de base de datos:', dbError);
      return NextResponse.json({
        error: 'Error al acceder a la base de datos',
        details: dbError.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error general:', error);
    return NextResponse.json({
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}
