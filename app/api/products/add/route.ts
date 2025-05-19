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

// Manejador POST para crear un producto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validación con Zod
    const parseResult = insertProductSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos en el producto', detalles: parseResult.error.errors },
        { status: 400 }
      );
    }
    const data = parseResult.data;

    // Convertir status a número
    let status: string | number = "draft";
    if (typeof data.status === "string" && data.status) {
      status = data.status.toLowerCase();
    } else if (typeof data.status === "number") {
      status = data.status;
    }
    const numericStatus = typeof status === "string"
      ? (status in statusMap ? statusMap[status as StatusKey] : statusMap.draft)
      : status;

    // Insertar en la base de datos
    const result = await db.products
      .insert(productsTable)
      .values({
        ...data,
        status: numericStatus,
      })
      .returning();

    return NextResponse.json({ message: "Producto creado exitosamente", productId: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
