import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MOCK_BOOKS,
  MOCK_PROMOTIONS,
  getLocalCart,
  getLocalCartItems,
  setLocalCartItems,
  getLocalOrders,
  saveLocalOrder,
  type Book,
  type Order,
  type Promotion,
  type Cart
} from './mockData';

export type { Book, Order, Promotion, Cart };

// Query key helpers
export const getHealthCheckQueryKey = () => ['health'];
export const getGetCatalogSummaryQueryKey = () => ['catalog', 'summary'];
export const getGetCatalogFiltersQueryKey = () => ['catalog', 'filters'];
export const getGetPromotionsQueryKey = () => ['catalog', 'promotions'];
export const getListBooksQueryKey = (params?: any) => ['books', params];
export const getGetCartQueryKey = () => ['cart'];
export const getListOrdersQueryKey = () => ['orders'];
export const getGetOrderQueryKey = (orderId: string) => ['orders', orderId];

// Hooks
export function useHealthCheck(options?: any) {
  return useQuery<{ status: string; timestamp: string }, Error>({
    queryKey: getHealthCheckQueryKey(),
    queryFn: async () => ({ status: 'ok', timestamp: new Date().toISOString() }),
    ...options?.query
  });
}

export function useGetCatalogSummary(options?: any) {
  return useQuery<{ bookCount: number; classCount: number; subjectCount: number; promotionCount: number }, Error>({
    queryKey: getGetCatalogSummaryQueryKey(),
    queryFn: async () => {
      const subjects = new Set(MOCK_BOOKS.map((b) => b.subject));
      return {
        bookCount: MOCK_BOOKS.length,
        classCount: 12,
        subjectCount: subjects.size,
        promotionCount: MOCK_PROMOTIONS.length
      };
    },
    ...options?.query
  });
}

export function useGetCatalogFilters(options?: any) {
  return useQuery<{ classes: { level: number; label: string; bookCount: number }[]; subjects: { name: string; bookCount: number }[] }, Error>({
    queryKey: getGetCatalogFiltersQueryKey(),
    queryFn: async () => {
      const classCounts = new Map<number, number>();
      const subjectCounts = new Map<string, number>();

      for (const book of MOCK_BOOKS) {
        classCounts.set(book.classLevel, (classCounts.get(book.classLevel) || 0) + 1);
        subjectCounts.set(book.subject, (subjectCounts.get(book.subject) || 0) + 1);
      }

      const classes = Array.from({ length: 12 }, (_, i) => ({
        level: i + 1,
        label: `Class ${i + 1}`,
        bookCount: classCounts.get(i + 1) || 0
      }));

      const subjects = Array.from(subjectCounts.entries())
        .map(([name, bookCount]) => ({ name, bookCount }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return { classes, subjects };
    },
    ...options?.query
  });
}

export function useGetPromotions(options?: any) {
  return useQuery<Promotion[], Error>({
    queryKey: getGetPromotionsQueryKey(),
    queryFn: async () => MOCK_PROMOTIONS,
    ...options?.query
  });
}

export function useListBooks(params?: { q?: string; classLevel?: number; subject?: string; dealOnly?: boolean; limit?: number }, options?: any) {
  return useQuery<Book[], Error>({
    queryKey: getListBooksQueryKey(params),
    queryFn: async () => {
      let filtered = [...MOCK_BOOKS];
      if (params?.q?.trim()) {
        const query = params.q.trim().toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            b.subject.toLowerCase().includes(query)
        );
      }
      if (params?.classLevel) {
        filtered = filtered.filter((b) => b.classLevel === params.classLevel);
      }
      if (params?.subject) {
        filtered = filtered.filter((b) => b.subject === params.subject);
      }
      if (params?.dealOnly) {
        filtered = filtered.filter((b) => b.price < b.originalPrice);
      }
      if (params?.limit) {
        filtered = filtered.slice(0, params.limit);
      }
      return filtered;
    },
    ...options?.query
  });
}

export function useGetCart(options?: any) {
  return useQuery<Cart, Error>({
    queryKey: getGetCartQueryKey(),
    queryFn: async () => getLocalCart(),
    ...options?.query
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: { bookId: string; quantity: number } }) => {
      const items = getLocalCartItems();
      const existingIndex = items.findIndex((i) => i.bookId === data.bookId);
      if (existingIndex >= 0) {
        items[existingIndex].quantity = Math.min(20, items[existingIndex].quantity + data.quantity);
      } else {
        items.push({ bookId: data.bookId, quantity: data.quantity });
      }
      setLocalCartItems(items);
      return getLocalCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    }
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, data }: { bookId: string; data: { quantity: number } }) => {
      const items = getLocalCartItems();
      const existingIndex = items.findIndex((i) => i.bookId === bookId);
      if (existingIndex >= 0) {
        items[existingIndex].quantity = data.quantity;
        setLocalCartItems(items);
      }
      return getLocalCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    }
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId }: { bookId: string }) => {
      let items = getLocalCartItems();
      items = items.filter((i) => i.bookId !== bookId);
      setLocalCartItems(items);
      return getLocalCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    }
  });
}

export function useListOrders(options?: any) {
  return useQuery<Order[], Error>({
    queryKey: getListOrdersQueryKey(),
    queryFn: async () => getLocalOrders(),
    ...options?.query
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return saveLocalOrder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    }
  });
}

export function useGetOrder(orderId: string, options?: any) {
  return useQuery<Order | null, Error>({
    queryKey: getGetOrderQueryKey(orderId),
    queryFn: async () => {
      const orders = getLocalOrders();
      return orders.find((o) => o.id === orderId) || null;
    },
    ...options?.query
  });
}
