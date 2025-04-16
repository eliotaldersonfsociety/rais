"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, HelpCircle, Info, Minus, Plus, X } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const { data: session, status } = useSession();
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "payu">("credit-card");
  const [tipAmount, setTipAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userSaldo, setUserSaldo] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = totalPrice * 0.19;
  const tip = tipAmount && tipAmount !== "none" ? totalPrice * (parseInt(tipAmount) / 100) : 0;
  const grandTotal = totalPrice + tax + tip;

  useEffect(() => {
    const fetchUserSaldo = async () => {
      if (!session?.user?.id) {
        console.log("Error: userId no encontrado o no autenticado");
        return;
      }

      try {
        const response = await fetch("/api/balance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
            total: 0,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al obtener el saldo:", errorData);
          throw new Error(errorData.message || "Error al obtener el saldo");
        }

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (data.saldo !== undefined) {
          setUserSaldo(data.saldo);
        } else {
          console.error("El saldo no está definido en la respuesta del servidor");
        }
      } catch (err) {
        console.error("Error al obtener el saldo:", err);
      }
    };

    fetchUserSaldo();
  }, [session]);

  const handlePago = async () => {
    try {
      setLoading(true);

      const carrito = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: typeof item.image === 'string' ? item.image : item.image[0],
        color: item.color,
        size: item.size,
        sizeRange: item.sizeRange,
      }));

      const metodoPago = paymentMethod === "credit-card" ? "saldo" : "payu";
      const propina = tip;

      const response = await fetch("/api/pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subtotal: totalPrice,
          tip: propina,
          shipping: 0,
          taxes: tax,
          total: grandTotal,
          productos: carrito,
          type: metodoPago,
        }),
      });

      const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al procesar el pago.");
    }

    // Actualiza el saldo del usuario
    setUserSaldo(data.newSaldo);

    // Define itemsParam and addressParam
    const itemsParam = encodeURIComponent(JSON.stringify(carrito));
    const addressParam = encodeURIComponent(JSON.stringify({
      firstname: (document.getElementById('firstname') as HTMLInputElement)?.value || '',
      lastname: (document.getElementById('lastname') as HTMLInputElement)?.value || '',
      address: (document.getElementById('address') as HTMLInputElement)?.value || '',
      apartment: (document.getElementById('apartment') as HTMLInputElement)?.value || '',
      city: (document.getElementById('city') as HTMLInputElement)?.value || '',
      province: (document.getElementById('province') as HTMLSelectElement)?.value || '',
      postal: (document.getElementById('postal') as HTMLInputElement)?.value || '',
      phone: (document.getElementById('phone') as HTMLInputElement)?.value || '',
    }));

    alert("¡Pago procesado con éxito!");
    // Redirige al usuario a la página de agradecimiento
    router.push(`/thankyou?orderId=123&total=${grandTotal}&items=${itemsParam}&shippingAddress=${addressParam}&tax=${tax}&tip=${tip}`);
  } catch (error) {
    console.error("Error en el pago:", error);
    alert("Hubo un error al procesar tu pago.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 p-4 md:p-8 bg-white">
        <div className="max-w-xl mx-auto">
          {status !== "authenticated" && (
            <>
              <h2 className="text-xl font-bold mb-4">Contacto</h2>
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <Link href="/auth?from=checkout" className="text-blue-600 text-sm">
                  Iniciar sesión
                </Link>
              </div>

              <div className="mb-6">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="w-full mb-2"
                />

                <div className="flex items-center gap-2">
                  <Checkbox id="marketing-email" defaultChecked />
                  <Label htmlFor="marketing-email" className="text-sm">
                    Enviarme novedades y ofertas por correo electrónico
                  </Label>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4">Entrega</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="country" className="sr-only">
                    País / Región
                  </Label>
                  <Select defaultValue="colombia">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="País / Región" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colombia">Colombia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstname" className="sr-only">
                      Nombre
                    </Label>
                    <Input id="firstname" placeholder="Nombre" />
                  </div>
                  <div>
                    <Label htmlFor="lastname" className="sr-only">
                      Apellidos
                    </Label>
                    <Input id="lastname" placeholder="Apellidos" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="sr-only">
                    Dirección
                  </Label>
                  <Input id="address" placeholder="Dirección" />
                </div>

                <div>
                  <Label htmlFor="apartment" className="sr-only">
                    Casa, apartamento, etc. (opcional)
                  </Label>
                  <Input id="apartment" placeholder="Casa, apartamento, etc. (opcional)" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="sr-only">
                      Ciudad
                    </Label>
                    <Input id="city" placeholder="Ciudad" />
                  </div>
                  <div>
                    <Label htmlFor="province" className="sr-only">
                      Provincia / Estado
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Provincia / Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bogota">Bogotá D.C.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postal" className="sr-only">
                      Código postal (opcional)
                    </Label>
                    <Input id="postal" placeholder="Código postal (opcional)" />
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="phone" className="sr-only">
                    Teléfono (opcional)
                  </Label>
                  <div className="flex">
                    <div className="relative flex-shrink-0">
                      <Input
                        id="phone"
                        placeholder="Teléfono (opcional)"
                        className="pl-16"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="flex items-center gap-1">
                          <Image
                            src="/placeholder.svg?height=20&width=30"
                            alt="Colombia flag"
                            width={20}
                            height={15}
                            className="rounded-sm"
                          />
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="save-info" />
                    <Label htmlFor="save-info" className="text-sm">
                      Guardar mi información y consultar más rápidamente la próxima vez
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="marketing-sms" />
                    <Label htmlFor="marketing-sms" className="text-sm">
                      Enviarme novedades y ofertas por SMS
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}

          <h2 className="text-xl font-bold mb-4">Métodos de envío</h2>
          <div className="border rounded-md mb-8">
            <RadioGroup defaultValue="standard">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="standard" value="standard" />
                  <Label htmlFor="standard">Standard</Label>
                </div>
                <span className="font-medium">Gratis</span>
              </div>
            </RadioGroup>
          </div>

          <h2 className="text-xl font-bold mb-4">Pago</h2>
          <p className="text-sm text-gray-600 mb-4">Todas las transacciones son seguras y están encriptadas.</p>

          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as "credit-card" | "payu")}
          >
            <div
              className={`border rounded-t-md p-4 flex justify-between items-center ${paymentMethod === "credit-card" ? "bg-blue-50 border-blue-500" : ""}`}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="credit-card" value="credit-card" />
                <Label htmlFor="credit-card">Saldo Disponible: ${userSaldo}</Label>
              </div>
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">$</div>
            </div>

            {paymentMethod === "credit-card" && (
              <div className="flex items-center gap-2">
                <Checkbox id="billing-address" defaultChecked />
                <Label htmlFor="billing-address" className="text-sm">
                  Usar el saldo que recargastes a la web
                </Label>
              </div>
            )}

            <div
              className={`border rounded-md p-4 flex justify-between items-center mt-2 ${paymentMethod === "payu" ? "bg-blue-50 border-blue-500" : ""}`}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="payu" value="payu" />
                <Label htmlFor="payu">A través de PayU: Tarjetas de crédito y más</Label>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-5 bg-blue-600 rounded"></div>
                <div className="w-8 h-5 bg-red-600 rounded"></div>
                <div className="w-8 h-5 bg-blue-400 rounded"></div>
                <div className="w-8 h-5 bg-blue-800 rounded"></div>
                <span className="text-xs text-gray-500">+13</span>
              </div>
            </div>
          </RadioGroup>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Agregar propina</h2>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox id="tip-support" defaultChecked />
                <Label htmlFor="tip-support" className="text-sm">
                  Da una muestra de apoyo al equipo de texasstore
                </Label>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <Button
                  variant={tipAmount === "5" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-auto py-3"
                  onClick={() => setTipAmount("5")}
                >
                  <span>5%</span>
                  <span className="text-xs">${(totalPrice * 0.05).toFixed(2)}</span>
                </Button>
                <Button
                  variant={tipAmount === "10" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-auto py-3"
                  onClick={() => setTipAmount("10")}
                >
                  <span>10%</span>
                  <span className="text-xs">${(totalPrice * 0.10).toFixed(2)}</span>
                </Button>
                <Button
                  variant={tipAmount === "20" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-auto py-3"
                  onClick={() => setTipAmount("20")}
                >
                  <span>20%</span>
                  <span className="text-xs">${(totalPrice * 0.20).toFixed(2)}</span>
                </Button>
                <Button
                  variant={tipAmount === "none" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-auto py-3"
                  onClick={() => setTipAmount("none")}
                >
                  <span>Ninguno</span>
                </Button>
              </div>
            </div>

            <p className="text-sm mb-8 text-center">Muchas gracias.</p>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg" disabled={loading} onClick={handlePago}>
              {loading ? 'Procesando...' : 'Pagar ahora'}
            </Button>
          </div>

          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-blue-600">
              Política de privacidad
            </a>
          </div>
        </div>
      </div>

      <div className="lg:w-2/5 bg-gray-100 p-4 md:p-8">
        <div className="max-w-md mx-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start gap-4 border-b pb-6 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded border flex items-center justify-center">
                  <Image
                    loader={({ src }) => src}
                    src={typeof item.image === 'string' ? item.image : item.image[0]}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="object-cover"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                  {item.quantity}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                {item.size && <p className="text-sm text-gray-600">Tamaño: {item.size}</p>}
                {item.sizeRange && <p className="text-sm text-gray-600">Rango de tamaño: {item.sizeRange}</p>}
              </div>
              <div className="text-right">
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}

          <div className="space-y-2 border-b pb-6 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Propina</span>
              <span>${tip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span className="font-medium">GRATIS</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span>Impuestos estimados</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">COP</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92143 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function setError(message: string) {
  console.error(message);
  alert(message);
}
