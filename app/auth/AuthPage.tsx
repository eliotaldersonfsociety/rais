//@/app/auth/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validations/registerSchemas";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("login");

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Form Data:", { email, password }); 

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      const fromCheckout = searchParams.get("from") === "checkout";
      if (fromCheckout) {
        router.push("/checkout?step=payment");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
  
    const parsed = registerSchema.safeParse(data);
  
    if (!parsed.success) {
      const errorMessage = parsed.error.errors[0]?.message || "Error en el formulario";
      setError(errorMessage);
      setIsLoading(false);
      return;
    }
  
    // Extraer solo los campos necesarios para el backend
    const {
      email,
      name,
      lastname,
      address,
      house_apt,
      city,
      state,
      postal_code,
      phone,
      password,
    } = parsed.data;
  
    const validData = {
      email,
      name,
      lastname,
      address,
      house_apt,
      city,
      state,
      postal_code,
      phone,
      password,
    };
  
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });
  
      const res = await response.json();
  
      if (!response.ok) {
        setError(res.error || "Error al registrar");
      } else {
        // ✅ Registro exitoso, cambiar a la pestaña de login
        setTab("login");
      }
    } catch (err) {
      setError("Error del servidor");
    }
  
    setIsLoading(false);
  };
  
  
  return (
    <div className="container mx-auto py-10">
      <Tabs value={tab} onValueChange={setTab} className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="correo@ejemplo.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Crear Cuenta</CardTitle>
              <CardDescription>Completa el formulario para registrarte.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" placeholder="Juan" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Apellidos</Label>
                    <Input id="lastname" name="lastname" placeholder="Pérez García" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" placeholder="Calle Principal 123" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="house-apt">Casa, apartamento, etc.</Label>
                  <Input id="house-apt" name="house_apt" placeholder="Apartamento 4B" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" name="city" placeholder="Madrid" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Provincia / Estado</Label>
                    <Input id="state" name="state" placeholder="Madrid" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Código postal</Label>
                    <Input id="postal-code" name="postal_code" placeholder="28001" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+34 600 000 000" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input id="confirm-password" name="confirm_password" type="password" required />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cargando..." : "Registrarse"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
