import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/lib/db/index";
import { products } from "@/lib/products/schema";

// Definición de la tabla de productos
export const productsTable = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"),
  costPerItem: real("cost_per_item"),
  vendor: text("vendor"),
  productType: text("product_type"),
  status: integer("status").notNull().default(1), // Cambiado a integer
  category: text("category"),
  tags: text("tags"),
  sku: text("sku"),
  barcode: text("barcode"),
  quantity: integer("quantity").notNull().default(0),
  trackInventory: integer("track_inventory").default(0), // Cambiado a integer
  images: text("images", { mode: "json" }).notNull().$type<string[]>(),
  sizes: text("sizes", { mode: "json" }).$type<string[] | null>(),
  sizeRange: text("size_range", { mode: "json" }).$type<{ min: number; max: number } | null>(),
  colors: text("colors", { mode: "json" }).$type<string[] | null>(),
});

// Esquemas Zod para validación
const insertProductSchema = createInsertSchema(productsTable).extend({
  sizes: z.array(z.string()).nullable(),
  sizeRange: z.object({ min: z.number(), max: z.number() }).nullable(),
  colors: z.array(z.string()).nullable(),
});
const selectProductSchema = createSelectSchema(productsTable);

// Tipo TypeScript basado en Zod
type Product = z.infer<typeof selectProductSchema>;

// Mapeo de estados
const statusMap = {
  active: 1,
  draft: 0,
} as const;

type StatusKey = keyof typeof statusMap;

function parseMaybeJSONOrCSV(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return typeof value === "string" ? value.split(",").map((v) => v.trim()) : [];
  }
}

function parseMaybeJSON(value: any, fallback: any = {}): any {
  if (!value) return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

// Manejador PUT para actualizar un producto
export async function PUT(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const productId = pathname.split("/").pop();

    if (!productId) {
      return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });
    }

    const numericId = Number(productId);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    // Validación con Zod (parcial, permite updates parciales)
    const partialProductSchema = insertProductSchema.partial();
    const parseResult = partialProductSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Datos inválidos en el update', detalles: parseResult.error.errors }, { status: 400 });
    }
    const data = parseResult.data;

    // Convertir status a número si viene
    let status: string | number | undefined = undefined;
    if (typeof data.status === "string" && data.status) {
      status = data.status.toLowerCase();
    } else if (typeof data.status === "number") {
      status = data.status;
    }
    const numericStatus = typeof status === "string"
      ? (status in statusMap ? statusMap[status as StatusKey] : undefined)
      : status;

    // Construir dinámicamente el objeto con campos definidos
    const updateData: any = { ...data };
    if (numericStatus !== undefined) updateData.status = numericStatus;

    // Verificar campos a actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No se proporcionaron campos para actualizar" }, { status: 400 });
    }

    await db.products.update(productsTable).set(updateData).where(eq(productsTable.id, numericId));

    return NextResponse.json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
