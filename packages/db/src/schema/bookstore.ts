import {
  boolean,
  integer,
  numeric,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const booksTable = pgTable("bookstore_books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  subject: text("subject").notNull(),
  classLevel: integer("class_level").notNull(),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  originalPrice: numeric("original_price", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  rating: real("rating").notNull().default(4.5),
  inStock: boolean("in_stock").notNull().default(true),
  badge: text("badge"),
});

export const promotionsTable = pgTable("bookstore_promotions", {
  id: text("id").primaryKey(),
  eyebrow: text("eyebrow").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  discount: integer("discount").notNull(),
  imageUrl: text("image_url").notNull(),
  background: text("background").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const cartItemsTable = pgTable(
  "bookstore_cart_items",
  {
    userId: text("user_id").notNull(),
    bookId: text("book_id")
      .notNull()
      .references(() => booksTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.bookId] })],
);

export const ordersTable = pgTable("bookstore_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("placed"),
  paymentMethod: text("payment_method").notNull(),
  itemCount: integer("item_count").notNull(),
  total: numeric("total", { precision: 10, scale: 2, mode: "number" }).notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItemsTable = pgTable("bookstore_order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  bookId: text("book_id").notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  unitPrice: numeric("unit_price", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: numeric("line_total", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
});
