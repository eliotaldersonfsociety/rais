"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/app/list/_components/product-form";
import { SVGCartLoader } from "@/components/loader/page";

async function getProduct(id: string) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const res = await fetch(`${baseUrl}/api/product/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export default function EditProduct() {
  const { id } = useParams(); // Obtener `id` en el cliente
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProduct(id as string)
        .then(setProduct)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
    <div className="flex justify-center items-center min-h-screen">
      <SVGCartLoader />
    </div>
    );
  }
  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/product/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}
