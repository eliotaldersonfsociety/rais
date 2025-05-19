"use client";



import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

import Cookies from "js-cookie";



export interface CartItem {

  id: number;

  name: string;

  price: number;

  image: string;

  quantity: number;

  color?: string | null;

  size?: string | null;

  sizeRange?: number | null;

}

interface CartContextType {

  cartItems: CartItem[];

  addToCart: (p: CartItem) => void;

  removeFromCart: (id: number) => void;

  clearCart: () => void;

}



const CartContext = createContext<CartContextType | undefined>(undefined);



export const CartProvider = ({ children }: { children: ReactNode }) => {

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {

    if (typeof window === "undefined") return [];

    const c = Cookies.get("cart");

    return c ? JSON.parse(c) : [];

  });



  // sincroniza cookie al cambiar cartItems

  useEffect(() => {

    if (cartItems.length === 0) Cookies.remove("cart");

    else Cookies.set("cart", JSON.stringify(cartItems), { expires: 7 });

  }, [cartItems]);



  const addToCart = useCallback((product: CartItem) => {

    setCartItems(prev => {

      const exist = prev.find(i => i.id === product.id);

      if (exist) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);

      return [...prev, { ...product, quantity: 1 }];

    });

  }, []);



  const removeFromCart = useCallback((productId: number) => {

    setCartItems(prev => {

      const item = prev.find(i => i.id === productId);

      if (!item) return prev;

      if (item.quantity === 1) return prev.filter(i => i.id !== productId);

      return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i);

    });

  }, []);



  const clearCart = useCallback(() => {

    setCartItems([]);

  }, []);



  const value = useMemo(() => ({ cartItems, addToCart, removeFromCart, clearCart }), [cartItems, addToCart, removeFromCart, clearCart]);



  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;

};



export const useCart = () => {

  const ctx = useContext(CartContext);

  if (!ctx) throw new Error("useCart must be inside CartProvider");

  return ctx;

};