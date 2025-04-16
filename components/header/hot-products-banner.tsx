"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronDown, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/CartContext" // asegúrate que este path sea correcto

interface Product {
  id: number
  title: string
  price: number
  images: string[]
}

function getRandomProducts<T>(array: T[], count: number): T[] {
  return array.sort(() => 0.5 - Math.random()).slice(0, count)
}

export default function HotProductsBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products") // cambia si tu endpoint es distinto
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error("Error al cargar productos:", err)
      }
    }

    fetchProducts()
  }, [])

  const hotProducts = getRandomProducts(products, 4)

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full py-1.5 text-sm font-medium bg-black text-white"
      >
        <Flame className="h-4 w-4 mr-2 text-orange-500" />
        Lo más hot
        <ChevronDown
          className={`h-4 w-4 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`w-full bg-black/95 backdrop-blur-md text-white overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hotProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex flex-col"
              >
                <div className="relative mb-2">
                  <Image
                    loader={({ src }) => src}
                    unoptimized
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    width={120}
                    height={120}
                    className="w-full h-auto object-cover rounded-md"
                  />
                  <Badge className="absolute top-2 right-2 bg-orange-500">Hot</Badge>
                </div>
                <h3 className="font-medium text-sm mb-1">{product.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.title,
                      price: product.price,
                      image: product.images[0],
                      quantity: 1,
                    })
                  }
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
