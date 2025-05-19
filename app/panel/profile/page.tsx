'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { useSession } from "next-auth/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Phone,
  Mail,
  User,
  FileText,
  Home,
  Building2,
  MapPin,
  FileDigit,
  CircleDollarSign,
  Calendar,
  Edit,
  ShieldUserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // Define the Purchase type
  type Purchase = {
    id: string;
    products: any[];
    total: number;
    date: string;
  };

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userSaldo, setUserSaldo] = useState<number>(0);
  const [lastWishlistId, setLastWishlistId] = useState(null);
  const [lastPurchaseDate, setLastPurchaseDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
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
            if (purchasesFixed.length > 0) {
              setLastPurchaseDate(new Date(purchasesFixed[0].created_at).toLocaleDateString());
            }
          }
        })
        .catch(error => {
          console.error('Error al obtener las compras:', error);
        });

      // Obtener el último ID de la wishlist
      fetch('/api/wishlist/numero')
        .then(response => response.json())
        .then(data => {
          if (data.lastWishlistId) {
            setLastWishlistId(data.lastWishlistId);
          }
        })
        .catch(error => {
          console.error('Error al obtener el último ID de la wishlist:', error);
        });

      // Obtener el saldo del usuario
      fetch('/api/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.saldo !== undefined) {
            setUserSaldo(data.saldo);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al obtener el saldo:', error);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Mi Perfil</h2>
          <Skeleton width={100} height={36} />
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Skeleton circle width={80} height={80} />
              <div className="space-y-2 flex-1">
                <Skeleton width={200} height={28} />
                <Skeleton width={150} height={20} />
              </div>
              <Skeleton width={120} height={36} />
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton circle width={36} height={36} />
                  <div className="flex-1">
                    <Skeleton width={100} height={16} />
                    <Skeleton width={180} height={20} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dirección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton circle width={36} height={36} />
                  <div className="flex-1">
                    <Skeleton width={100} height={16} />
                    <Skeleton width={180} height={20} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <CardTitle className="text-2xl mb-4">No estás autenticado</CardTitle>
          <CardDescription>Inicia sesión para ver tu perfil</CardDescription>
        </Card>
      </div>
      </DashboardLayout>
    );
  }

  const { name, lastname, email, phone, address, house_apt, city, state, postal_code } = session.user;
  const initials = `${name?.charAt(0) || ""}${lastname?.charAt(0) || ""}`;
  const memberSince = new Date().getFullYear() - Math.floor(Math.random() * 3); // Placeholder

  return (
    <DashboardLayout>
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Mi Perfil</h2>
        <Button variant="outline" size="sm" className="bg-lime-300">
        <ShieldUserIcon className="h-4 w-4 mr-2" />
          Administrador
        </Button>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-900" />
        <CardHeader className="pt-0 pb-4">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center -mt-12">
            <Avatar className="h-24 w-24 border-4 border-background bg-blue-300">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${initials}`}
                alt={`${name} ${lastname}`}
                className="bg-cyan-400"
              />
              <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h3 className="text-2xl font-bold">
                {name} {lastname}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
              <Calendar className="h-4 w-4" />
              Miembro desde {memberSince}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">
                    {name} {lastname}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                  <p className="font-medium">{email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Disponible</p>
                  <p className="font-medium text-lg">${Number(userSaldo).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <FileDigit className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Wishlist</p>
                  <p className="font-medium">{lastWishlistId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Última Compra</p>
                  <p className="font-medium">{lastPurchaseDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-600" />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calle</p>
                  <p className="font-medium">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Apartamento/Casa</p>
                  <p className="font-medium">{house_apt}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ciudad</p>
                  <p className="font-medium">{city}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-medium">{state}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                    <FileDigit className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Código Postal</p>
                    <p className="font-medium">{postal_code}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-cyan-600" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Saldo Actual</p>
              <p className="text-2xl font-bold text-black">${Number(userSaldo).toFixed(2)}</p>
            </div>
            <div className="bg-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Lista de Deseos</p>
              <p className="text-2xl font-bold text-black">{lastWishlistId}</p>
            </div>
            <div className="bg-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Última Compra</p>
              <p className="text-2xl font-bold text-black">{lastPurchaseDate}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button className="bg-lime-300" variant="outline" size="sm">
            <ShieldUserIcon className="h-4 w-4 mr-2" />
            Administrador
          </Button>
        </CardFooter>
      </Card>
    </div>
    </DashboardLayout>
  );
}
