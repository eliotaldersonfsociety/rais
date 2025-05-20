import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/productcard/page";
import { Product } from "@/types/product";
import { DashboardLayouts } from "@/components/dashboard-layouts";

export default async function ProductsPage() {
  const res = await fetch("http://localhost:3000/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudieron obtener los productos");
  const products = await res.json() as Product[];

  return (
    <DashboardLayouts>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Productos</h1>
          <Link href="/list/new">
          <Button>Agregar Producto</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No hay productos disponibles</p>
          <Link href="/list/new" className="mt-4 inline-block">
            <Button>Agregar tu primer producto</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
    </DashboardLayouts>
  );
}
