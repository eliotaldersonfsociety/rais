'use client';

import { DashboardLayouts } from "@/components/dashboard-layouts";
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
  sizeRange?: string | null;
}

interface Purchase {
  id: string;
  description: string;
  total: number;
  created_at: string;
  products: Product[];
}

export default function PanelPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [lastWishlistId, setLastWishlistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [comprasPendientes, setComprasPendientes] = useState<any[]>([]);
  const purchasesPerPage = 5;

  useEffect(() => {
    if (isLoaded && user && !user.publicMetadata?.isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user && user.publicMetadata?.isAdmin) {
      // Obtener compras
      fetch('/api/pagos/numerodepagos')
        .then(response => {
          console.log('Response from /api/pagos/numerodepagos:', response);
          return response.json();
        })
        .then(data => {
          console.log('Data from /api/pagos/numerodepagos:', data);
          if (data.purchases) {
            const purchasesFixed = data.purchases.map((purchase: any) => ({
              ...purchase,
              products: typeof purchase.products === 'string' ? JSON.parse(purchase.products) : purchase.products,
            }));
            setPurchases(purchasesFixed);
            if (typeof window !== "undefined") {
              localStorage.setItem('compras_pendientes', JSON.stringify(purchasesFixed));
              setComprasPendientes(purchasesFixed);
            }
          }
        })
        .catch(error => {
          console.error('Error al obtener las compras:', error);
        });

      // WISHLIST: 1. Cargar de localStorage
      if (typeof window !== "undefined") {
        const localWishlistId = localStorage.getItem('dashboard_lastWishlistId');
        if (localWishlistId) {
          setLastWishlistId(Number(localWishlistId));
        }
      }

      // WISHLIST: 2. Fetch API
      fetch('/api/wishlist/numero')
        .then(response => {
          console.log('Response from /api/wishlist/numero:', response);
          return response.json();
        })
        .then(data => {
          setLastWishlistId(data.lastWishlistId);
          console.log('Data from /api/wishlist/numero:', data);
          if (data.wishlistCount) {
            localStorage.setItem('wishlist_count', data.wishlistCount);
          }
        })
        .catch(error => {
          console.error('Error al obtener el último ID de la wishlist:', error);
        });

      // SALDO: 1. Cargar de localStorage
      if (typeof window !== "undefined") {
        const localSaldo = localStorage.getItem('dashboard_saldo');
        if (localSaldo) {
          setSaldo(Number(localSaldo));
          setLoading(false);
        }
      }

      // SALDO: 2. Fetch API
      fetch('/api/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })
        .then(response => {
          console.log('Response from /api/balance:', response);
          return response.json();
        })
        .then(data => {
          console.log('Data from /api/balance:', data);
          if (data.saldo !== undefined) {
            setSaldo(data.saldo);
            if (typeof window !== "undefined") {
              localStorage.setItem('dashboard_saldo', data.saldo);
            }
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al obtener el saldo:', error);
          setLoading(false);
        });

      // Cargar comprasPendientes
      if (typeof window !== "undefined") {
        const compras = localStorage.getItem('compras_pendientes');
        if (compras) {
          setComprasPendientes(JSON.parse(compras));
        }
      }
    }
  }, [user, isLoaded]);

  const name = user?.firstName || '';
  const lastname = user?.lastName || '';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const lastPurchaseId = purchases.length > 0 ? purchases[0].id : 'N/A';
  const lastPurchaseDate = purchases.length > 0 ? new Date(purchases[0].created_at).toLocaleDateString() : 'N/A';

  // Paginación
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = purchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(purchases.length / purchasesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <DashboardLayouts>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel Administrativo</h1>
          <div className="text-sm text-gray-500">
            {name} {lastname} - {email}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta Saldo */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Saldo Actual</h3>
            {loading ? (
              <Skeleton width={120} height={32} />
            ) : (
              <div className="text-3xl font-bold text-emerald-600">
                ${saldo?.toFixed(2)}
              </div>
            )}
          </div>

          {/* Tarjeta Última Compra */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Última Compra</h3>
            <div className="space-y-1">
              <p className="text-gray-600">ID: {lastPurchaseId}</p>
              <p className="text-gray-600">Fecha: {lastPurchaseDate}</p>
            </div>
          </div>

          {/* Tarjeta Wishlists */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Wishlists Activas
            </h3>
            
            {/* Mostrar conteo en vez de último ID */}
            {data?.wishlistCount !== undefined ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  {data.wishlistCount}
                </span>
                <span className="text-sm text-gray-500">
                  (Último ID: {data.lastWishlistId || 'N/A'})
                </span>
              </div>
            ) : (
              <Skeleton width={80} height={32} />
            )}
          </div>

        {/* Tabla de Compras */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Historial de Compras</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Mostrando {indexOfFirstPurchase + 1}-{Math.min(indexOfLastPurchase, purchases.length)} de {purchases.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Descripción</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{purchase.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{purchase.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">${purchase.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(purchase.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="inline-block h-4 w-4" /> Anterior
            </button>
            
            <div className="hidden md:flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="inline-block h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayouts>
  );
}
