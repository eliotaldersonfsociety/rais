"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductDisplay from "./product-display";
import { SVGCartLoader } from "@/components/loader/page"

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  vendor?: string;
  productType?: string;
  status?: boolean;
  category?: string;
  tags?: string;
  sku?: string;
  barcode?: string;
  quantity?: number;
  trackInventory?: boolean;
  images: string[];
  sizes?: string[];
  sizeRange?: { min: number; max: number };
  colors?: string[];
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const router = useRouter();
  const params = useParams(); // ✅ Obtiene los parámetros de la URL

  useEffect(() => {
    console.log("Product ID from URL:", params.id);
    if (!params.id) {
      router.push("/404");
      return;
    }

    fetch(`/api/product/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Producto recibido:", data);
        if (data.length === 0) {
          router.push("/404");
        } else {
          setProduct(data); // ✅ Asegúrate de que se esté obteniendo el primer producto del arreglo
        }
      })
      .catch(() => router.push("/404"));
  }, [params.id, router]);

  if (!product) return (
    <div className="flex justify-center items-center min-h-screen">
      <SVGCartLoader />
    </div>
  )

  return <ProductDisplay product={product} />;
}
