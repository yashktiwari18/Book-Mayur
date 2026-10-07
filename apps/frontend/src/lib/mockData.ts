export interface Book {
  id: string;
  title: string;
  author: string;
  subject: string;
  classLevel: number;
  price: number;
  originalPrice: number;
  imageUrl: string;
  description: string;
  rating: number;
  inStock: boolean;
  badge: string | null;
}

export interface Promotion {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  discount: number;
  imageUrl: string;
  background: string;
  sortOrder: number;
}

export interface CartItem {
  book: Book;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface OrderItem {
  orderId?: string;
  bookId: string;
  title: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'placed' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: string;
  itemCount: number;
  total: number;
  customerName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  createdAt: string;
  items: OrderItem[];
}

export const MOCK_BOOKS: Book[] = [
  {
    id: "math-1",
    title: "Numbers Around Us",
    author: "A. Sharma",
    subject: "Mathematics",
    classLevel: 1,
    price: 279,
    originalPrice: 349,
    imageUrl: "/book-covers/mathematics.svg",
    description: "A playful first mathematics reader with colorful number activities.",
    rating: 4.8,
    inStock: true,
    badge: "New"
  },
  {
    id: "english-2",
    title: "Little Words, Big Stories",
    author: "M. Iyer",
    subject: "English",
    classLevel: 2,
    price: 319,
    originalPrice: 399,
    imageUrl: "/book-covers/english.svg",
    description: "Build early reading confidence through short stories and guided practice.",
    rating: 4.9,
    inStock: true,
    badge: "Bestseller"
  },
  {
    id: "math-3",
    title: "Maths in Motion",
    author: "R. Mehta",
    subject: "Mathematics",
    classLevel: 3,
    price: 349,
    originalPrice: 449,
    imageUrl: "/book-covers/mathematics.svg",
    description: "A clear, activity-led mathematics book for curious young learners.",
    rating: 4.7,
    inStock: true,
    badge: "Popular"
  },
  {
    id: "science-4",
    title: "Curious Science",
    author: "N. Kapoor",
    subject: "Science",
    classLevel: 4,
    price: 389,
    originalPrice: 499,
    imageUrl: "/book-covers/science.svg",
    description: "Explore everyday science through experiments, questions, and illustrations.",
    rating: 4.6,
    inStock: true,
    badge: null
  },
  {
    id: "english-5",
    title: "The Story Studio",
    author: "P. Nair",
    subject: "English",
    classLevel: 5,
    price: 329,
    originalPrice: 425,
    imageUrl: "/book-covers/english.svg",
    description: "Reading, grammar, and writing practice in one lively workbook.",
    rating: 4.8,
    inStock: true,
    badge: "Bestseller"
  },
  {
    id: "math-5-core",
    title: "Everyday Mathematics",
    author: "A. Kulkarni",
    subject: "Mathematics",
    classLevel: 5,
    price: 359,
    originalPrice: 449,
    imageUrl: "/book-covers/mathematics.svg",
    description: "Build fluency with clear examples, number sense, and practical class 5 exercises.",
    rating: 4.7,
    inStock: true,
    badge: "Popular"
  },
  {
    id: "math-5-practice",
    title: "Maths Practice Book: Class 5",
    author: "M. Shah",
    subject: "Mathematics",
    classLevel: 5,
    price: 249,
    originalPrice: 329,
    imageUrl: "/book-covers/mathematics.svg",
    description: "A companion workbook with extra practice for the year's key topics.",
    rating: 4.5,
    inStock: true,
    badge: null
  },
  {
    id: "social-5",
    title: "Our Living World",
    author: "S. Banerjee",
    subject: "Social Studies",
    classLevel: 5,
    price: 379,
    originalPrice: 499,
    imageUrl: "/book-covers/social-studies.svg",
    description: "A student-friendly introduction to people, places, and the past.",
    rating: 4.6,
    inStock: true,
    badge: null
  },
  {
    id: "math-6",
    title: "Mathematics: New Perspectives",
    author: "K. Desai",
    subject: "Mathematics",
    classLevel: 6,
    price: 429,
    originalPrice: 549,
    imageUrl: "/book-covers/mathematics.svg",
    description: "Concept-first lessons and worked examples for class 6.",
    rating: 4.8,
    inStock: true,
    badge: "Popular"
  },
  {
    id: "science-7",
    title: "Science Lab: Class 7",
    author: "T. Rao",
    subject: "Science",
    classLevel: 7,
    price: 449,
    originalPrice: 599,
    imageUrl: "/book-covers/science.svg",
    description: "Connect scientific ideas to the world through hands-on learning.",
    rating: 4.7,
    inStock: true,
    badge: null
  },
  {
    id: "english-8",
    title: "English Literature & Language",
    author: "V. Menon",
    subject: "English",
    classLevel: 8,
    price: 419,
    originalPrice: 549,
    imageUrl: "/book-covers/english.svg",
    description: "A balanced coursebook for thoughtful reading and confident writing.",
    rating: 4.6,
    inStock: true,
    badge: null
  },
  {
    id: "math-9",
    title: "Algebra & Geometry",
    author: "D. Joshi",
    subject: "Mathematics",
    classLevel: 9,
    price: 489,
    originalPrice: 649,
    imageUrl: "/book-covers/mathematics.svg",
    description: "Step-by-step explanations and graded practice for secondary mathematics.",
    rating: 4.9,
    inStock: true,
    badge: "Exam pick"
  },
  {
    id: "physics-10",
    title: "Physics: Clear Concepts",
    author: "A. Kulkarni",
    subject: "Physics",
    classLevel: 10,
    price: 529,
    originalPrice: 699,
    imageUrl: "/book-covers/science.svg",
    description: "Build strong physics fundamentals with diagrams and solved problems.",
    rating: 4.8,
    inStock: true,
    badge: "Exam pick"
  },
  {
    id: "biology-11",
    title: "Life Science Illustrated",
    author: "F. Thomas",
    subject: "Biology",
    classLevel: 11,
    price: 559,
    originalPrice: 749,
    imageUrl: "/book-covers/science.svg",
    description: "A visual, detailed guide to core biology concepts and terminology.",
    rating: 4.7,
    inStock: true,
    badge: null
  },
  {
    id: "chemistry-12",
    title: "Chemistry: The Complete Course",
    author: "J. Patel",
    subject: "Chemistry",
    classLevel: 12,
    price: 599,
    originalPrice: 799,
    imageUrl: "/book-covers/science.svg",
    description: "A rigorous chemistry reference designed for final-year school study.",
    rating: 4.9,
    inStock: true,
    badge: "Exam pick"
  },
  {
    id: "hindi-4",
    title: "Hindi Bhasha Setu",
    author: "R. Verma",
    subject: "Hindi",
    classLevel: 4,
    price: 299,
    originalPrice: 399,
    imageUrl: "/book-covers/hindi.svg",
    description: "Reading and language practice for a confident Hindi foundation.",
    rating: 4.6,
    inStock: true,
    badge: null
  }
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "back-to-school",
    eyebrow: "THE SCHOOL YEAR STARTS HERE",
    title: "A brighter year begins with a good book.",
    subtitle: "Save on hand-picked school essentials for every class.",
    discount: 35,
    imageUrl: "/books-editorial.jpg",
    background: "#285b45",
    sortOrder: 0
  },
  {
    id: "study-bundles",
    eyebrow: "SMARTER STUDY, BETTER VALUE",
    title: "Build your class bundle.",
    subtitle: "Find the right reads for the year ahead.",
    discount: 25,
    imageUrl: "/books-editorial.jpg",
    background: "#596e78",
    sortOrder: 1
  },
  {
    id: "weekend-reads",
    eyebrow: "A LITTLE EXTRA FOR CURIOUS MINDS",
    title: "More stories. More discovery.",
    subtitle: "Selected books with special savings this week.",
    discount: 20,
    imageUrl: "/books-editorial.jpg",
    background: "#e9ddc8",
    sortOrder: 2
  }
];

// Helper LocalStorage Storage handlers
const CART_KEY = 'bookbazaar_cart_items';
const ORDERS_KEY = 'bookbazaar_orders';

export function getLocalCartItems(): { bookId: string; quantity: number }[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [{ bookId: 'math-5-core', quantity: 1 }, { bookId: 'science-4', quantity: 1 }];
  } catch {
    return [];
  }
}

export function setLocalCartItems(items: { bookId: string; quantity: number }[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {}
}

export function getLocalCart(): Cart {
  const itemsMap = getLocalCartItems();
  const items: CartItem[] = [];
  for (const item of itemsMap) {
    const book = MOCK_BOOKS.find((b) => b.id === item.bookId);
    if (book) {
      items.push({
        book,
        quantity: item.quantity,
        lineTotal: Number((book.price * item.quantity).toFixed(2))
      });
    }
  }
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = Number(items.reduce((acc, item) => acc + item.lineTotal, 0).toFixed(2));
  return { items, itemCount, subtotal };
}

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Sample initial order
  const sampleOrder: Order = {
    id: "ORD-92834112",
    userId: "demo_user",
    status: "processing",
    paymentMethod: "cash_on_delivery",
    itemCount: 2,
    total: 678,
    customerName: "Alex Reader",
    phone: "9876543210",
    addressLine: "123 Knowledge Avenue",
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110001",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      {
        bookId: "math-5-core",
        title: "Everyday Mathematics",
        imageUrl: "/book-covers/mathematics.svg",
        unitPrice: 359,
        quantity: 1,
        lineTotal: 359
      },
      {
        bookId: "english-2",
        title: "Little Words, Big Stories",
        imageUrl: "/book-covers/english.svg",
        unitPrice: 319,
        quantity: 1,
        lineTotal: 319
      }
    ]
  };
  return [sampleOrder];
}

export function saveLocalOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'userId' | 'items' | 'itemCount' | 'total'>): Order {
  const currentCart = getLocalCart();
  const orderId = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const orderItems: OrderItem[] = currentCart.items.map((item) => ({
    orderId,
    bookId: item.book.id,
    title: item.book.title,
    imageUrl: item.book.imageUrl,
    unitPrice: item.book.price,
    quantity: item.quantity,
    lineTotal: item.lineTotal
  }));

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    userId: "demo_user",
    status: "placed",
    itemCount: currentCart.itemCount,
    total: currentCart.subtotal,
    createdAt: new Date().toISOString(),
    items: orderItems
  };

  const orders = getLocalOrders();
  orders.unshift(newOrder);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    setLocalCartItems([]);
  } catch {}
  return newOrder;
}
