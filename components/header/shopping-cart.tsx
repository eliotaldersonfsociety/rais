"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCartIcon as CartIcon, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import type { CartItem } from "@/components/header/page";

interface ShoppingCartProps {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: number) => void;
}

export default function ShoppingCart({
  cartItems,
  addToCart,
  removeFromCart,
}: ShoppingCartProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <CartIcon className="h-5 w-5" />
          {cartItems.length > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="backdrop-blur-lg bg-background/80 p-6">
        <SheetHeader>
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
          <Image
            src="/tsn.png"
            alt="Carrito"
            width={120}
            height={40}
            className="mx-auto"
          />
        </SheetHeader>

        <div className="py-4 h-[calc(100vh-180px)] overflow-y-auto">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 mb-4">
                <Image
                  loader={({ src }) => src}
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  unoptimized
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </p>
                  {item.color && <p className="text-sm">Color: {item.color}</p>}
                  {item.size && <p className="text-sm">Size: {item.size}</p>}
                  {item.sizeRange && <p className="text-sm">Size Range: {item.sizeRange}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => addToCart(item)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between font-medium mb-4">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" className="w-full mb-2">
                  Close
                </Button>
              </SheetClose>
              <Button
                className="w-full"
                onClick={() => {
                    router.push("/checkout");
                }}
              >
                Checkout
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
