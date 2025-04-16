"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import HeroBanner from "@/components/hero/page"
import { SVGCartLoader } from "@/components/loader/page"

interface Product {
  id: number
  title: string
  description: string
  price: number
  quantity: number
  status: boolean
  images: string[]
}

// Loader personalizado para permitir cualquier URL externa
const customLoader = ({ src }: { src: string }) => src

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Productos recibidos desde la API:", data)
        setProducts(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <SVGCartLoader />
    </div>
  )

  return (
    <>
      <HeroBanner />
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lista de Productos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col"
          >
            <div className="relative h-48 w-full bg-gray-100">
              {Array.isArray(product.images) && product.images.length > 0 ? (
                <Image
                  loader={customLoader}
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No disponible</div>
              )}
              <Badge className={`absolute top-2 right-2 ${product.status ? "bg-green-500" : "bg-red-500"}`}>
                {product.status ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold text-lg mb-1 line-clamp-1">{product.title}</h2>
              <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>

              <div className="mt-auto flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Stock: {product.quantity}</p>
                </div>
                <Link href={`/product/${product.id}`}>
                  <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-3 py-1.5 rounded text-sm">
                    Ver Producto
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}
