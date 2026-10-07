import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { Router, type IRouter, type RequestHandler } from "express";
import {
  AddCartItemBody,
  AddCartItemResponse,
  CreateOrderBody,
  CreateOrderResponse,
  GetCatalogFiltersResponse,
  GetCatalogSummaryResponse,
  GetCartResponse,
  GetOrderParams,
  GetOrderResponse,
  GetPromotionsResponse,
  ListBooksQueryParams,
  ListBooksResponse,
  ListOrdersResponse,
  RemoveCartItemParams,
  RemoveCartItemResponse,
  UpdateCartItemBody,
  UpdateCartItemParams,
  UpdateCartItemResponse,
} from "@workspace/api-zod";
import {
  booksTable,
  cartItemsTable,
  db,
  orderItemsTable,
  ordersTable,
  promotionsTable,
} from "@workspace/db";
import { ensureBookstoreSeeded } from "../lib/bookstoreSeed";

const router: IRouter = Router();

const requireAuth: RequestHandler = (req, res, next) => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }
  res.locals.userId = userId;
  next();
};

function bookResponse(book: typeof booksTable.$inferSelect) {
  return {
    ...book,
    badge: book.badge ?? null,
  };
}

async function getCartForUser(userId: string) {
  const rows = await db
    .select({ book: booksTable, quantity: cartItemsTable.quantity })
    .from(cartItemsTable)
    .innerJoin(booksTable, eq(cartItemsTable.bookId, booksTable.id))
    .where(eq(cartItemsTable.userId, userId))
    .orderBy(asc(booksTable.title));

  const items = rows.map(({ book, quantity }) => ({
    book: bookResponse(book),
    quantity,
    lineTotal: Number((book.price * quantity).toFixed(2)),
  }));

  return GetCartResponse.parse({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: Number(
      items.reduce((total, item) => total + item.lineTotal, 0).toFixed(2),
    ),
  });
}

async function orderResponse(order: typeof ordersTable.$inferSelect) {
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id))
    .orderBy(asc(orderItemsTable.id));

  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    items,
  };
}

router.get("/catalog/summary", async (_req, res): Promise<void> => {
  await ensureBookstoreSeeded();
  const books = await db.select({ id: booksTable.id }).from(booksTable);
  const subjects = new Set(
    (await db.select({ subject: booksTable.subject }).from(booksTable)).map(
      (row) => row.subject,
    ),
  );
  const promotions = await db
    .select({ id: promotionsTable.id })
    .from(promotionsTable);

  res.json(
    GetCatalogSummaryResponse.parse({
      bookCount: books.length,
      classCount: 12,
      subjectCount: subjects.size,
      promotionCount: promotions.length,
    }),
  );
});

router.get("/catalog/filters", async (_req, res): Promise<void> => {
  await ensureBookstoreSeeded();
  const rows = await db
    .select({
      classLevel: booksTable.classLevel,
      subject: booksTable.subject,
    })
    .from(booksTable);
  const countsByClass = new Map<number, number>();
  const countsBySubject = new Map<string, number>();
  for (const row of rows) {
    countsByClass.set(
      row.classLevel,
      (countsByClass.get(row.classLevel) ?? 0) + 1,
    );
    countsBySubject.set(
      row.subject,
      (countsBySubject.get(row.subject) ?? 0) + 1,
    );
  }

  res.json(
    GetCatalogFiltersResponse.parse({
      classes: Array.from({ length: 12 }, (_, index) => ({
        level: index + 1,
        label: `Class ${index + 1}`,
        bookCount: countsByClass.get(index + 1) ?? 0,
      })),
      subjects: Array.from(countsBySubject, ([name, bookCount]) => ({
        name,
        bookCount,
      })).sort((a, b) => a.name.localeCompare(b.name)),
    }),
  );
});

router.get("/catalog/promotions", async (_req, res): Promise<void> => {
  await ensureBookstoreSeeded();
  const promotions = await db
    .select()
    .from(promotionsTable)
    .orderBy(asc(promotionsTable.sortOrder));
  res.json(GetPromotionsResponse.parse(promotions));
});

router.get("/books", async (req, res): Promise<void> => {
  await ensureBookstoreSeeded();
  const rawDealOnly = req.query.dealOnly;
  if (
    rawDealOnly !== undefined &&
    rawDealOnly !== "true" &&
    rawDealOnly !== "false"
  ) {
    res.status(400).json({ error: "dealOnly must be true or false." });
    return;
  }
  const parsed = ListBooksQueryParams.safeParse({
    ...req.query,
    ...(rawDealOnly !== undefined
      ? { dealOnly: rawDealOnly === "true" }
      : {}),
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q, classLevel, subject, dealOnly, limit = 24 } = parsed.data;
  const filters = [];
  if (typeof q === "string" && q.trim()) {
    const term = `%${q.trim()}%`;
    filters.push(
      sql`(${ilike(booksTable.title, term)} OR ${ilike(booksTable.author, term)} OR ${ilike(booksTable.subject, term)})`,
    );
  }
  if (typeof classLevel === "number") {
    filters.push(eq(booksTable.classLevel, classLevel));
  }
  if (typeof subject === "string" && subject) {
    filters.push(eq(booksTable.subject, subject));
  }
  if (dealOnly) {
    filters.push(sql`${booksTable.price} < ${booksTable.originalPrice}`);
  }

  const books = await db
    .select()
    .from(booksTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(booksTable.classLevel), asc(booksTable.title))
    .limit(limit);
  res.json(ListBooksResponse.parse(books.map(bookResponse)));
});

router.get("/cart", requireAuth, async (_req, res): Promise<void> => {
  const cart = await getCartForUser(res.locals.userId as string);
  res.json(cart);
});

router.post("/cart/items", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await ensureBookstoreSeeded();
  const [book] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, parsed.data.bookId));
  if (!book || !book.inStock) {
    res.status(404).json({ error: "That book is no longer available." });
    return;
  }

  await db
    .insert(cartItemsTable)
    .values({
      userId: res.locals.userId as string,
      bookId: book.id,
      quantity: parsed.data.quantity,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [cartItemsTable.userId, cartItemsTable.bookId],
      set: {
        quantity: sql`LEAST(${cartItemsTable.quantity} + ${parsed.data.quantity}, 20)`,
        updatedAt: new Date(),
      },
    });

  res.json(AddCartItemResponse.parse(await getCartForUser(res.locals.userId as string)));
});

router.patch(
  "/cart/items/:bookId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateCartItemParams.safeParse(req.params);
    const body = UpdateCartItemBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({
        error: !params.success
          ? params.error.message
          : !body.success
            ? body.error.message
            : "Invalid cart item.",
      });
      return;
    }

    const [updated] = await db
      .update(cartItemsTable)
      .set({ quantity: body.data.quantity, updatedAt: new Date() })
      .where(
        and(
          eq(cartItemsTable.userId, res.locals.userId as string),
          eq(cartItemsTable.bookId, params.data.bookId),
        ),
      )
      .returning({ bookId: cartItemsTable.bookId });
    if (!updated) {
      res.status(404).json({ error: "That book is not in your cart." });
      return;
    }

    res.json(
      UpdateCartItemResponse.parse(
        await getCartForUser(res.locals.userId as string),
      ),
    );
  },
);

router.delete(
  "/cart/items/:bookId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = RemoveCartItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, res.locals.userId as string),
          eq(cartItemsTable.bookId, params.data.bookId),
        ),
      );
    res.json(
      RemoveCartItemResponse.parse(
        await getCartForUser(res.locals.userId as string),
      ),
    );
  },
);

router.get("/orders", requireAuth, async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, res.locals.userId as string))
    .orderBy(desc(ordersTable.createdAt));
  const response = await Promise.all(orders.map(orderResponse));
  res.json(ListOrdersResponse.parse(response));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = res.locals.userId as string;
  const created = await db.transaction(async (tx) => {
    const rows = await tx
      .select({ book: booksTable, quantity: cartItemsTable.quantity })
      .from(cartItemsTable)
      .innerJoin(booksTable, eq(cartItemsTable.bookId, booksTable.id))
      .where(eq(cartItemsTable.userId, userId));

    if (rows.length === 0) return null;

    const itemCount = rows.reduce((total, row) => total + row.quantity, 0);
    const total = Number(
      rows
        .reduce((sum, row) => sum + row.book.price * row.quantity, 0)
        .toFixed(2),
    );
    const id = randomUUID();
    const createdAt = new Date();
    const checkout = parsed.data;
    const [order] = await tx
      .insert(ordersTable)
      .values({
        id,
        userId,
        status: "placed",
        paymentMethod: checkout.paymentMethod,
        itemCount,
        total,
        customerName: checkout.customerName,
        phone: checkout.phone,
        addressLine: checkout.addressLine,
        city: checkout.city,
        state: checkout.state,
        postalCode: checkout.postalCode,
        createdAt,
      })
      .returning();
    const lineItems = rows.map(({ book, quantity }) => ({
      orderId: id,
      bookId: book.id,
      title: book.title,
      imageUrl: book.imageUrl,
      unitPrice: book.price,
      quantity,
      lineTotal: Number((book.price * quantity).toFixed(2)),
    }));
    await tx.insert(orderItemsTable).values(lineItems);
    await tx.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      items: lineItems,
    };
  });

  if (!created) {
    res.status(400).json({ error: "Add a book to your cart before checkout." });
    return;
  }

  res.status(201).json(CreateOrderResponse.parse(created));
});

router.get(
  "/orders/:orderId",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = GetOrderParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.id, params.data.orderId),
          eq(ordersTable.userId, res.locals.userId as string),
        ),
      );
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    res.json(GetOrderResponse.parse(await orderResponse(order)));
  },
);

export default router;
