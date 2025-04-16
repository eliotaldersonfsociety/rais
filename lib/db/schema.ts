//@/lib/db/schema.ts
import { pgTable, serial, varchar, boolean, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  lastname: varchar("lastname", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }),
  postal_code: varchar("postal_code", { length: 20 }),
  saldo: numeric("saldo", { precision: 10, scale: 2 }).default('0.00'),
  isAdmin: boolean("is_admin").default(false),
  phone: varchar("phone", { length: 20 }),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow(),
  item_name: varchar("item_name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 })
    .$type<"por enviar" | "enviado" | "entregado" | "pending">()
    .default("pending"),
  name: varchar("name", { length: 100 }).notNull(),
  lastname: varchar("lastname", { length: 100 }).notNull(),
  direction: text("direction").notNull(),
  postalcode: varchar("postalcode", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  payment_method: varchar("payment_method", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

// Tipos generados automáticamente
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
