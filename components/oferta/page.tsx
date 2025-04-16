"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  description?: string;
  images: string[]; // La API retorna un array de strings
  sale_price: string;
  compareAtPrice: string;
  price: string;
}

// Loader personalizado que retorna la URL sin cambios
const customLoader = ({ src }: { src: string }) => src;

export default function Ofert() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch de productos desde el endpoint /api/products/
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products/");
        if (!res.ok) {
          console.error("Error fetching products:", res.statusText);
          return;
        }
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Acción de agregar al carrito (por ahora solo loguea el producto)
  const handleAddToCart = (product: Product) => {
    console.log("Producto agregado:", product);
  };

  // Manejo del scroll en el carrusel
  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = 320; // Ancho aproximado de una tarjeta + margen
        if (direction === "left") {
          container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          setCurrentProductIndex(Math.max(0, currentProductIndex - 1));
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
          setCurrentProductIndex(
            Math.min(products.length - 1, currentProductIndex + 1)
          );
        }
      }
    },
    [currentProductIndex, products.length]
  );

  // Ciclo automático cada 5 segundos para cambiar de producto
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) =>
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={currentProductIndex === 0}
              className="hidden md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={currentProductIndex >= products.length - 1}
              className="hidden md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {loading ? (
          <p className="text-center text-lg font-semibold">
            Cargando productos...
          </p>
        ) : (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-6 snap-x scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Tarjeta fija de "Ofertas del Día" */}
              <div className="min-w-[200px] max-w-[200px] h-[400px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col justify-center items-center snap-start">
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Ofertas del Día
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Descubre nuestras mejores promociones con descuentos
                    increíbles
                  </p>
                  <Link href="/pages/categorias/promociones">
                    <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-3 py-1.5 rounded text-sm">
                      Hasta 40% OFF
                    </button>
                  </Link>
                </div>
              </div>
              {/* Tarjetas de productos */}
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[200px] max-w-[200px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col snap-start hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        loader={customLoader}
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No disponible
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          parseFloat(product.sale_price)
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        -{product.sale_price
                          ? Math.round(
                              ((parseFloat(product.compareAtPrice) -
                                parseFloat(product.sale_price)) /
                                parseFloat(product.compareAtPrice)) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="font-semibold text-lg mb-1 line-clamp-1">
                      {product.title}
                    </h2>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {product.description || ""}
                    </p>
                    <div className="mt-auto flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">
                          ${product.sale_price || product.price}
                        </p>
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
            {/* Indicadores de scroll en versión móvil */}
            <div className="flex justify-center gap-1 mt-4 md:hidden">
              {products.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentProductIndex ? "w-6 bg-blue-500" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
  );
}
