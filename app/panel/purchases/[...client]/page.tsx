"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { DashboardLayouts } from "@/components/dashboard-layouts"
import { PurchaseDetailsModal } from "@/components/purchase-details-modal"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"

interface PurchaseItem {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  sizeRange?: string | null;
}

interface Purchase {
  id: string | number;
  description: string;
  total: number;
  created_at: number | string;
  products: string | PurchaseItem[];
  items?: PurchaseItem[];
  status?: string;
  payuData?: {
    transactionState: string;
    paymentMethod: number;
    authorizationCode: string;
  };
  user_id?: string;
}

export default function PurchasesPage() {
  const { isSignedIn, user } = useUser();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPageSaldo, setCurrentPageSaldo] = useState(1);
  const [currentPagePayu, setCurrentPagePayu] = useState(1);
  const [activeTab, setActiveTab] = useState("saldo");
  const [totalItems, setTotalItems] = useState({ saldo: 0, payu: 0 });
  const [lastUpdate, setLastUpdate] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;
  const [adminTab, setAdminTab] = useState(false);

  // Función para verificar si hay nuevas compras
  const checkForNewPurchases = async (type: 'saldo' | 'payu') => {
    if (!isSignedIn || !user) return;
    try {
      const res = await fetch(`/api/pagos/numerodepagos?page=1&type=${type}`);
      const data = await res.json();
      if (data.purchases && data.purchases.length > 0) {
        const latestPurchaseDate = new Date(Number(data.purchases[0].created_at)).getTime();
        const storedLastUpdate = lastUpdate[type] || 0;
        if (latestPurchaseDate > storedLastUpdate) {
          // Hay nuevas compras, actualizar datos
          await fetchPurchases(1, type, true);
          setLastUpdate(prev => ({ ...prev, [type]: latestPurchaseDate }));
        }
      }
    } catch (error) {
      console.error('Error checking for new purchases:', error);
    }
  };

  // Función para guardar en localStorage con timestamp de última actualización
  const saveToLocalStorage = (type: 'saldo' | 'payu', data: any) => {
    try {
      const timestamp = Date.now();
      localStorage.setItem(`purchases_${type}`, JSON.stringify({
        timestamp,
        lastUpdate: timestamp,
        data: data
      }));
      setLastUpdate(prev => ({ ...prev, [type]: timestamp }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Función para obtener de localStorage
  const getFromLocalStorage = (type: 'saldo' | 'payu') => {
    try {
      const stored = localStorage.getItem(`purchases_${type}`);
      if (stored) {
        const { timestamp, lastUpdate: storedLastUpdate, data } = JSON.parse(stored);
        // Verificar si los datos tienen menos de 1 minuto
        if (Date.now() - timestamp < 60 * 1000) {
          setLastUpdate(prev => ({ ...prev, [type]: storedLastUpdate }));
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return null;
  };

  const fetchPurchases = async (page: number, type: 'saldo' | 'payu', forceRefresh = false, admin = false) => {
    setLoading(true);
    let url = admin
      ? `/api/pagos/todas?page=${page}&type=${type}`
      : `/api/pagos/numerodepagos?page=${page}&type=${type}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.purchases) {
      const parsedPurchases = data.purchases.map((purchase: Purchase) => {
        try {
          return {
            ...purchase,
            products: typeof purchase.products === 'string'
              ? JSON.parse(purchase.products.replace(/\n/g, '').trim())
              : purchase.products,
            payuData: purchase.payuData || null
          };
        } catch (error) {
          return {
            ...purchase,
            products: [{
              name: purchase.description || 'Producto sin nombre',
              price: purchase.total || 0,
              quantity: 1
            }],
            payuData: purchase.payuData || null
          };
        }
      });
      setPurchases(parsedPurchases);
      if (type === 'saldo') {
        setTotalItems(prev => ({ ...prev, saldo: data.pagination.total }));
      } else {
        setTotalItems(prev => ({ ...prev, payu: data.pagination.total }));
      }
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  // Función para actualizar manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const type = activeTab as 'saldo' | 'payu';
    const page = activeTab === 'payu' ? currentPagePayu : currentPageSaldo;
    await fetchPurchases(page, type, true);
  };

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const type = activeTab === 'payu' ? 'payu' : 'saldo';
    const page = activeTab === 'payu' ? currentPagePayu : currentPageSaldo;
    fetchPurchases(page, type, false, adminTab);
    // Configurar verificación periódica de nuevas compras
    const interval = setInterval(() => {
      checkForNewPurchases(type);
    }, 30000); // Verificar cada 30 segundos
    return () => clearInterval(interval);
  }, [isSignedIn, user, activeTab, currentPagePayu, currentPageSaldo, adminTab]);

  const handleRowClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  // Calcular total de páginas para cada tipo
  const totalPagesSaldo = Math.ceil(totalItems.saldo / itemsPerPage);
  const totalPagesPayu = Math.ceil(totalItems.payu / itemsPerPage);

  // Renderizar la tabla de compras
  const renderPurchasesTable = (purchases: Purchase[]) => {
    if (purchases.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay compras registradas en esta categoría.</p>
        </div>
      );
    }
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th>Usuario</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {purchases.map((purchase, index) => {
            const validItems = Array.isArray(purchase.products) 
              ? purchase.products 
              : typeof purchase.products === 'string'
                ? JSON.parse(purchase.products)
                : [];
            return (
              <tr
                key={`${purchase.payuData ? 'payu' : 'saldo'}_${purchase.id}_${index}`}
                onClick={() => handleRowClick(purchase)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td>{purchase.user_id || "-"}</td>
                <td className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                  {purchase.payuData ? `PayU-${purchase.id}` : `#${purchase.id}`}
                </td>
                <td className="px-4 py-3 text-xs sm:text-sm">
                  <div className="line-clamp-2">
                    {validItems.length > 0 
                      ? validItems.map((item: any) => item.name).join(", ")
                      : purchase.description || "Sin descripción"
                    }
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                  {new Date(Number(purchase.created_at)).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    purchase.payuData?.transactionState === 'APPROVED' || purchase.status === 'Completado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {purchase.payuData?.transactionState === 'APPROVED' || purchase.status === 'Completado'
                      ? 'Completado'
                      : 'Pendiente'
                    }
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs sm:text-sm whitespace-nowrap">
                  ${typeof purchase.total === 'number' 
                    ? purchase.total.toFixed(2) 
                    : parseFloat(purchase.total || '0').toFixed(2)
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <DashboardLayouts>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Mis Compras</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
        
        <div className="mb-4 flex gap-2">
          <Button
            variant={!adminTab ? "default" : "outline"}
            onClick={() => setAdminTab(false)}
          >
            Mis Compras
          </Button>
          <Button
            variant={adminTab ? "default" : "outline"}
            onClick={() => setAdminTab(true)}
          >
            Todas las Compras
          </Button>
        </div>
        
        <Tabs 
          defaultValue="saldo" 
          className="w-full" 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value as 'saldo' | 'payu');
            if (value === 'saldo') {
              setCurrentPageSaldo(1);
            } else {
              setCurrentPagePayu(1);
            }
            fetchPurchases(1, value as 'saldo' | 'payu', false, adminTab);
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="saldo" className="text-center">
              Saldo ({totalItems.saldo})
            </TabsTrigger>
            <TabsTrigger value="payu" className="text-center">
              PayU ({totalItems.payu})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saldo" className="mt-4">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Compras con Saldo</h3>
                {loading ? (
                  <div className="p-6 text-center">Cargando compras...</div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        {renderPurchasesTable(purchases)}
                      </div>
                    </div>
                    {totalPagesSaldo > 1 && (
                      <div className="flex items-center justify-center gap-2 py-4 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageSaldo(prev => Math.max(1, prev - 1))}
                          disabled={currentPageSaldo === 1 || loading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Página {currentPageSaldo} de {totalPagesSaldo}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageSaldo(prev => Math.min(totalPagesSaldo, prev + 1))}
                          disabled={currentPageSaldo >= totalPagesSaldo || loading}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payu" className="mt-4">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Compras con PayU</h3>
                {loading ? (
                  <div className="p-6 text-center">Cargando compras...</div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        {renderPurchasesTable(purchases)}
                      </div>
                    </div>
                    {totalPagesPayu > 1 && (
                      <div className="flex items-center justify-center gap-2 py-4 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPagePayu(prev => Math.max(1, prev - 1))}
                          disabled={currentPagePayu === 1 || loading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Página {currentPagePayu} de {totalPagesPayu}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPagePayu(prev => Math.min(totalPagesPayu, prev + 1))}
                          disabled={currentPagePayu >= totalPagesPayu || loading}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedPurchase && (
        <PurchaseDetailsModal 
          purchase={selectedPurchase} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </DashboardLayouts>
  );
}
