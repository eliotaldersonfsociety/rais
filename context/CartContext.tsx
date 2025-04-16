"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import Cookies from "js-cookie"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  color?: string | null
  size?: string | null
  sizeRange?: number | null
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: CartItem) => void
  removeFromCart: (productId: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = Cookies.get("cart")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    Cookies.set("cart", JSON.stringify(cartItems), { expires: 7 })
  }, [cartItems])

  const addToCart = (product: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId)
      if (!existingItem) return prevItems

      if (existingItem.quantity === 1) {
        return prevItems.filter((item) => item.id !== productId)
      } else {
        return prevItems.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
    })
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider")
  }
  return context
}
