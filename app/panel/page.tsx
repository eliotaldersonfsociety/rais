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
        .then(response => response.json())
        .then(data => {
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
        .catch(error => console.error('Error al obtener las compras:', error));

      // Wishlist
      if (typeof window !== "undefined") {
        const localWishlistId = localStorage.getItem('dashboard_lastWishlistId');
        if (localWishlistId) setLastWishlistId(Number(localWishlistId));
      }

      fetch('/api/wishlist/numero')
        .then(response => response.json())
        .then(data => {
          if (data.lastWishlistId) {
            setLastWishlistId(data.lastWishlistId);
            if (typeof window !== "undefined") {
              localStorage.setItem('dashboard_lastWishlistId', data.lastWishlistId);
            }
          }
        })
        .catch(error => console.error('Error al obtener wishlist:', error));

      // Saldo
      if (typeof window !== "undefined") {
        const localSaldo = localStorage.getItem('dashboard_saldo');
        if (localSaldo) {
          setSaldo(Number(localSaldo));
          setLoading(false);
        }
      }

      fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.saldo !== undefined) {
            setSaldo(data.saldo);
            if (typeof window !== "undefined") {
              localStorage.setItem('dashboard_saldo', data.saldo);
            }
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al obtener saldo:', error);
          setLoading(false);
        });

      if (typeof window !== "undefined") {
        const compras = localStorage.getItem('compras_pendientes');
        if (compras) setComprasPendientes(JSON.parse(compras));
      }
    }
  }, [user, isLoaded]);

  const name = user?.firstName || '';
  const lastname = user?.lastName || '';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const lastPurchaseId = purchases[0]?.id || 'N/A';
  const lastPurchaseDate = purchases[0]?.created_at ? 
    new Date(purchases[0].created_at).toLocaleDateString() : 'N/A';

  // Paginación
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = purchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(purchases.length / purchasesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <DashboardLayouts>
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Saldo Actual</h3>
            {loading ? (
              <Skeleton width={100} height={24} />
            ) : (
              <p className="text-2xl font-bold text-emerald-600">
                ${saldo?.toFixed(2)}
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Última Compra</h3>
            <p className="text-gray-600">ID: {lastPurchaseId}</p>
            <p className="text-gray-600">Fecha: {lastPurchaseDate}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Wishlists Activas</h3>
            {lastWishlistId ? (
              <p className="text-2xl font-bold text-blue-600">{lastWishlistId}</p>
            ) : (
              <Skeleton width={50} />
            )}
          </div>
        </div>

        {/* Tabla de Compras */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Historial de Compras</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Descripción</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {currentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b">
                    <td className="py-4">{purchase.id}</td>
                    <td className="py-4">{purchase.description}</td>
                    <td className="py-4">${purchase.total.toFixed(2)}</td>
                    <td className="py-4">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginación */}
          <div className="flex justify-end items-center mt-6 gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayouts>
  );
}
