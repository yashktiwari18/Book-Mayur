import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown,
  ChevronRight, CircleHelp, GraduationCap, Heart, Home, LogOut, MapPin,
  Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Star, UserRound, X, ClipboardList, AlertCircle,
  LoaderCircle, BookMarked, RotateCcw, MessageSquare,
} from 'lucide-react';
import { Link, Redirect, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import {
  useHealthCheck, getHealthCheckQueryKey,
  useGetCatalogSummary, getGetCatalogSummaryQueryKey,
  useGetCatalogFilters, getGetCatalogFiltersQueryKey,
  useGetPromotions, getGetPromotionsQueryKey,
  useListBooks, getListBooksQueryKey,
  useGetCart, getGetCartQueryKey,
  useAddCartItem, useUpdateCartItem, useRemoveCartItem,
  useListOrders, getListOrdersQueryKey,
  useCreateOrder, useGetOrder, getGetOrderQueryKey,
  type Book, type Order, type Promotion,
} from './lib/useBookstore';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 45_000, retry: 1, refetchOnWindowFocus: false } },
});
let clerkPubKey: string | undefined;
try {
  const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (envKey && typeof envKey === 'string' && envKey.startsWith('pk_')) {
    const derived = publishableKeyFromHost(window.location.hostname, envKey);
    clerkPubKey = derived || undefined;
  }
} catch {
  clerkPubKey = undefined;
}
const clerkProxyUrl = import.meta.env.DEV ? undefined : import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

// Standalone (no-Clerk) versions of auth hooks
function useDemoUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      firstName: 'Book Bazaar',
      fullName: 'Demo Reader',
      primaryEmailAddress: { emailAddress: 'reader@bookbazaar.in' },
    },
  };
}
function useDemoAuth() {
  return { isLoaded: true, isSignedIn: true };
}

// Selects the right hook at a stable call-site level (no conditional hook inside a single component)
const useSafeUser: () => ReturnType<typeof useUser> | ReturnType<typeof useDemoUser> = clerkPubKey
  ? () => useUser()    // eslint-disable-line react-hooks/rules-of-hooks
  : useDemoUser;

const useSafeAuth: () => { isLoaded: boolean; isSignedIn: boolean | undefined } = clerkPubKey
  ? () => useAuth()   // eslint-disable-line react-hooks/rules-of-hooks
  : useDemoAuth;

const clerkAppearance = {
  theme: shadcn, cssLayerName: 'clerk',
  options: { logoPlacement: 'inside' as const, logoLinkUrl: basePath || '/', logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: {
    colorPrimary: '#285b45', colorForeground: '#284336', colorMutedForeground: '#718076',
    colorDanger: '#b54d3f', colorBackground: '#fffdf7', colorInput: '#fbf8ef',
    colorInputForeground: '#284336', colorNeutral: '#d8d1c1', fontFamily: 'DM Sans, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full max-w-[440px] flex justify-center',
    cardBox: 'bg-[#fffdf7] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#284336] font-semibold', headerSubtitle: 'text-[#718076]',
    socialButtonsBlockButtonText: 'text-[#284336] font-medium', formFieldLabel: 'text-[#284336]',
    footerActionLink: 'text-[#285b45] font-semibold', footerActionText: 'text-[#718076]',
    dividerText: 'text-[#718076]', identityPreviewEditButton: 'text-[#285b45]',
    formFieldSuccessText: 'text-[#285b45]', alertText: 'text-[#9b3f35]',
    logoBox: 'rounded-xl overflow-hidden', logoImage: 'object-contain',
    socialButtonsBlockButton: 'border-[#e4dfd3] hover:bg-[#f6f2e8]',
    formButtonPrimary: 'bg-[#285b45] hover:bg-[#204a38] text-white',
    formFieldInput: 'bg-[#fbf8ef] border-[#d8d1c1] text-[#284336]',
    footerAction: 'text-[#718076]', dividerLine: 'bg-[#e4dfd3]',
    alert: 'bg-[#fff3ef] border-[#f1d4ca]', otpCodeFieldInput: 'border-[#d8d1c1]',
    formFieldRow: 'text-[#284336]', main: 'text-[#284336]',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const cache = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) cache.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, cache]);
  return null;
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  const routes = (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/shop"><Protected><ShopPage /></Protected></Route>
      <Route path="/search"><Protected><SearchPage /></Protected></Route>
      <Route path="/cart"><Protected><CartPage /></Protected></Route>
      <Route path="/orders"><Protected><OrdersPage /></Protected></Route>
      <Route path="/orders/:orderId"><Protected><OrderDetailPage /></Protected></Route>
      <Route path="/profile"><Protected><ProfilePage /></Protected></Route>
      <Route><NotFound /></Route>
    </Switch>
  );

  if (!clerkPubKey) {
    return (
      <QueryClientProvider client={queryClient}>
        {routes}
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Your next school year starts here.' } },
        signUp: { start: { title: 'Join Book Bazaar', subtitle: 'Books for every bright beginning.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        {routes}
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function SignInPage() {
  if (!clerkPubKey) return <Redirect to="/shop" />;
  return <div className="auth-scene"><div className="auth-aside"><Brand /><p>All the right books<br />for a year of big ideas.</p><small>Thoughtfully selected for every classroom, from Class 1 to 12.</small></div><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}
function SignUpPage() {
  if (!clerkPubKey) return <Redirect to="/shop" />;
  return <div className="auth-scene"><div className="auth-aside"><Brand /><p>A fresh chapter<br />starts right here.</p><small>Join families making school shopping a little simpler.</small></div><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}
// Clerk-aware version â€” only used inside ClerkProvider
function HomeRedirectClerk() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingPage />;
  return isSignedIn ? <Redirect to="/shop" /> : <LandingPage />;
}
// Standalone version â€” no Clerk dependency
function HomeRedirectDemo() {
  return <Redirect to="/shop" />;
}

// Clerk-aware guard â€” only used inside ClerkProvider
function ProtectedClerk({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingPage />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}
// Standalone passthrough â€” no auth required
function ProtectedDemo({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Aliases resolved once at module load â€” stable component references, no conditional hooks
const HomeRedirect = clerkPubKey ? HomeRedirectClerk : HomeRedirectDemo;
const Protected = clerkPubKey ? ProtectedClerk : ProtectedDemo;

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`brand${compact ? ' brand-compact' : ''}`} data-testid="link-home-brand">
    <span className="brand-mark"><BookOpen size={21} strokeWidth={1.8} /></span>
    <span>book<span className="brand-accent">bazaar</span><small>THE SCHOOL BOOKSHOP</small></span>
  </Link>;
}

function LandingPage() {
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const summary = useGetCatalogSummary({ query: { queryKey: getGetCatalogSummaryQueryKey() } });
  const filters = useGetCatalogFilters({ query: { queryKey: getGetCatalogFiltersQueryKey() } });
  const promo = useGetPromotions({ query: { queryKey: getGetPromotionsQueryKey() } });
  const promotions = promo.data ?? [];
  const featured = promotions[0];
  return <main className="landing">
    <MobileAppHome
      promotions={promotions}
      classes={filters.data?.classes ?? []}
      subjects={filters.data?.subjects ?? []}
      bookCount={summary.data?.bookCount ?? 0}
    />
    <header className="landing-nav wrap"><Brand /><div className="nav-help"><CircleHelp size={17} /> Here for the school year</div><div className="nav-actions"><Link href="/sign-in" className="nav-signin">Sign in</Link><Link href="/sign-up" className="button button-primary" data-testid="link-create-account">Create account <ArrowUpRight size={16} /></Link></div></header>
    <section className="landing-hero wrap">
      <div className="hero-copy"><div className="eyebrow"><span /> SCHOOL LISTS, SORTED.</div><h1>Every class.<br />Every <em>bright</em><br />beginning.</h1><p>The books students need, picked with care and delivered to your door. Make this school year the easiest one yet.</p><div className="hero-ctas"><Link href="/sign-up" className="button button-primary button-large">Start your book list <ArrowRight size={18} /></Link><Link href="/sign-in" className="text-link">Already have an account <ArrowUpRight size={15} /></Link></div><div className="trust-row"><span className="trust-icon"><ShieldCheck size={19} /></span><span><b>Safe, simple & school-ready</b><small>Thoughtfully chosen for the new school year</small></span></div></div>
      <div className="hero-art" aria-label="School books arranged on a desk"><div className="art-frame"><img src="/books-editorial.jpg" alt="Colorful school books ready for a new term" /><div className="art-stamp"><span>THE</span><b>NEW<br />TERM</b><span>STARTS HERE</span></div></div><div className="art-note"><Sparkles size={16} /> Good books. Great starts.</div><div className="art-count"><b>{summary.data?.bookCount ?? '120+'}</b><span>books for<br />every learner</span></div></div>
    </section>
    <section className="landing-strip"><div className="wrap strip-inner"><span>CLASS 1â€”12</span><i /><span>CURATED SUBJECTS</span><i /><span>DOORSTEP DELIVERY</span><i /><span>PAY ON DELIVERY</span>{health.data?.status === 'ok' && <span className="health-live"><i /> Shop is online</span>}</div></section>
    <section className="landing-why wrap"><div><span className="eyebrow">THE BOOK BAZAAR DIFFERENCE</span><h2>A school list,<br /><em>without the scramble.</em></h2></div><div className="why-copy"><p>Skip the last-minute hunt from shop to shop. Find the right titles by class and subject, bundle what you need, and check out in a few easy steps.</p><Link href="/sign-up" className="text-link">Find your books <ArrowRight size={16} /></Link></div></section>
    <section className="landing-promo wrap"><div className="promo-mini"><div className="promo-art"><img src={featured?.imageUrl || '/books-editorial.jpg'} alt="" onError={(event) => { event.currentTarget.src = '/books-editorial.jpg'; }} /><div className="promo-copy"><span>{featured?.eyebrow || 'A LITTLE SOMETHING EXTRA'}</span><b>{featured?.title || 'A brighter school year, for less.'}</b><small>{featured?.subtitle || 'Explore thoughtful savings on class essentials.'}</small><Link href="/sign-up" className="promo-link">Explore offers <ArrowRight size={15} /></Link></div><strong>{featured?.discount ? `${featured.discount}%` : 'SAVE'}<small>ON SELECT<br />SCHOOL LISTS</small></strong></div></div><div className="landing-footer"><Brand compact /><span>Thoughtful books for curious minds.</span><small>Book Bazaar</small></div></section>
  </main>;
}

function MobileAppHome({
  promotions,
  classes,
  subjects,
  bookCount,
}: {
  promotions: Promotion[];
  classes: { level: number; label: string; bookCount: number }[];
  subjects: { name: string; bookCount: number }[];
  bookCount: number;
}) {
  const [activePromotion, setActivePromotion] = useState(0);
  const promotion = promotions[activePromotion] ?? promotions[0];
  const { isSignedIn } = useSafeAuth();

  return <div className="mobile-app-home">
    <header className="mobile-app-header">
      <Brand compact />
      <div className="mobile-delivery">
        <MapPin size={18} />
        <span><small>BOOKS FOR</small><b>Classes 1â€”12</b></span>
        <ChevronDown size={14} />
      </div>
      <Link href="/sign-in" className="mobile-account-link" aria-label="Sign in">
        <UserRound size={19} />
      </Link>
    </header>

    <div className="mobile-home-tabs" aria-label="Browse book collections">
      <a className="mobile-home-tab active" href="#mobile-class-list">By class</a>
      <a className="mobile-home-tab" href="#mobile-subject-list">By subject</a>
    </div>

    <section className="mobile-featured-offer" aria-label="Featured book offer">
      {promotion ? <Link
        href="/sign-up"
        className="mobile-offer-card"
        style={{
          backgroundColor: promotion.background,
          backgroundImage: `linear-gradient(90deg, #173c30ed 0%, #285b45c9 56%, #285b4540 100%), url(${promotion.imageUrl})`,
        }}
      >
        <span className="mobile-offer-eyebrow">{promotion.eyebrow}</span>
        <span className="mobile-offer-discount">UP TO {promotion.discount}% OFF</span>
        <h1>{promotion.title}</h1>
        <p>{promotion.subtitle}</p>
        <span className="mobile-offer-button">Browse the offer <ArrowRight size={15} /></span>
      </Link> : <Link href="/sign-up" className="mobile-offer-card mobile-offer-fallback">
        <span className="mobile-offer-eyebrow">BOOKS FOR EVERY CLASSROOM</span>
        <h1>A good year<br />starts with a good book.</h1>
        <span className="mobile-offer-button">Browse books <ArrowRight size={15} /></span>
      </Link>}
      {promotions.length > 1 && <div className="mobile-offer-dots" aria-label="Choose a promotion">
        {promotions.map((item, index) => <button
          key={item.id}
          type="button"
          className={index === activePromotion ? 'active' : ''}
          aria-label={`Show offer ${index + 1}`}
          aria-pressed={index === activePromotion}
          onClick={() => setActivePromotion(index)}
        />)}
      </div>}
    </section>

    <section className="mobile-subject-list" id="mobile-subject-list">
      <div className="mobile-section-heading">
        <div><span className="eyebrow">THE RIGHT SUBJECT</span><h2>Browse subjects</h2></div>
        <Link href="/sign-in" aria-label="Browse all subjects"><ArrowRight size={17} /></Link>
      </div>
      <div className="mobile-subject-rail">
        {subjects.map((subject) => <Link className="mobile-subject-item" href="/sign-in" key={subject.name}>
          <span className="mobile-subject-icon"><BookOpen size={20} /></span>
          <b>{subject.name}</b>
          <small>{subject.bookCount} {subject.bookCount === 1 ? 'title' : 'titles'}</small>
        </Link>)}
      </div>
    </section>

    <section className="mobile-class-list" id="mobile-class-list">
      <div className="mobile-section-heading">
        <div><span className="eyebrow">SCHOOL BOOKS, SORTED</span><h2>Shop by class</h2></div>
        <span className="mobile-book-count">{bookCount} books</span>
      </div>
      <div className="mobile-class-rail">
        {classes.map((grade) => <Link className="mobile-class-card" href="/sign-in" key={grade.level}>
          <span>CLASS</span>
          <strong>{String(grade.level).padStart(2, '0')}</strong>
          <small>{grade.bookCount} {grade.bookCount === 1 ? 'book' : 'books'}</small>
        </Link>)}
      </div>
    </section>

    <Link href="/sign-up" className="mobile-start-card">
      <span className="mobile-start-icon"><Sparkles size={19} /></span>
      <span><b>Build your school list</b><small>Good books, all in one place</small></span>
      <ArrowRight size={17} />
    </Link>

    <MobileBottomNav active="/shop" count={0} isSignedIn={isSignedIn} />
  </div>;
}

function LoadingPage() {
  return <div className="loading-page"><div className="loader-mark"><BookOpen size={24} /></div><div className="skeleton-line wide" /><div className="skeleton-line" /></div>;
}
function Busy({ label = 'Loading your books' }: { label?: string }) {
  return <div className="busy-state" role="status"><span className="busy-mark"><BookOpen size={20} /></span><b>{label}</b><div className="skeleton-grid"><i /><i /><i /></div></div>;
}
function ErrorState({ retry }: { retry: () => void }) {
  return <div className="state-panel"><span className="state-icon"><AlertCircle size={22} /></span><h3>That page took a wrong turn.</h3><p>We couldnâ€™t load this just now. Check your connection and try again.</p><button className="button button-outline" onClick={retry} data-testid="button-retry">Try again <ArrowRight size={15} /></button></div>;
}
function EmptyState({ title, text, action, to = '/shop' }: { title: string; text: string; action: string; to?: string }) {
  return <div className="state-panel empty-panel"><span className="state-icon"><BookMarked size={23} /></span><h3>{title}</h3><p>{text}</p><Link className="button button-primary" href={to}>{action} <ArrowRight size={15} /></Link></div>;
}
function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

const navItems = [
  { href: '/shop', label: 'Home', Icon: Home },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/cart', label: 'Cart', Icon: ShoppingCart },
  { href: '/orders', label: 'Orders', Icon: ClipboardList },
  { href: '/profile', label: 'Profile', Icon: UserRound },
];

function MobileBottomNav({
  active,
  count,
  isSignedIn: isSignedInProp,
}: {
  active: string;
  count: number;
  isSignedIn?: boolean;
}) {
  const { isSignedIn: authIsSignedIn } = useSafeAuth();
  const isSignedIn = isSignedInProp ?? authIsSignedIn;

  return <nav className="bottom-nav" aria-label="Main navigation">
    {navItems.map(({ href, label, Icon }) => {
      const destination = label === 'Home' && !isSignedIn ? '/' : href;
      return <Link key={href} href={destination} className={`bottom-link ${active === href ? 'selected' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`}>
        <span className="nav-icon-wrap"><Icon size={22} strokeWidth={active === href ? 2.2 : 1.8} />{label === 'Cart' && count > 0 && <i>{count}</i>}</span>
        <small>{label}</small>
      </Link>;
    })}
  </nav>;
}

function AppShell({ children, active }: { children: ReactNode; active: string }) {
  const { user } = useSafeUser();
  const cartQuery = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const count = cartQuery.data?.itemCount ?? 0;
  return <div className="app-shell">
    <header className="shop-header"><div className="wrap header-inner"><Brand compact /><div className="header-location"><MapPin size={17} /><span><small>DELIVERY DETAILS</small><b>Confirm at checkout</b></span><ChevronDown size={14} /></div><nav className="header-tabs" aria-label="Shop navigation"><Link href="/shop" className={active === '/shop' ? 'tab-active' : ''} data-testid="link-header-home">Home</Link><Link href="/search" className={active === '/search' ? 'tab-active' : ''} data-testid="link-header-search">Search</Link><Link href="/orders" className={active === '/orders' ? 'tab-active' : ''} data-testid="link-header-orders">Orders</Link></nav><div className="header-search"><Search size={17} /><Link href="/search">Search books, authors, subjects...</Link><kbd>âŒ˜ K</kbd></div><Link href="/cart" className="header-cart" aria-label="Open cart" data-testid="link-header-cart"><ShoppingBag size={20} /><span>{count}</span></Link><Link href="/profile" className="header-avatar" aria-label="Profile">{user?.firstName?.slice(0, 1) || 'P'}</Link></div></header>
    <main className="wrap page-content">{children}</main>
    <MobileBottomNav active={active} count={count} />
    <footer className="desktop-footer wrap"><span>Book Bazaar Â· The school bookshop</span><span>Books chosen for a better school day.</span></footer>
  </div>;
}

function PageHeading({ kicker, title, text, children }: { kicker?: string; title: string; text?: string; children?: ReactNode }) {
  return <div className="page-heading"><div>{kicker && <div className="eyebrow">{kicker}</div>}<h1>{title}</h1>{text && <p>{text}</p>}</div>{children}</div>;
}
function ShopPage() {
  const summary = useGetCatalogSummary({ query: { queryKey: getGetCatalogSummaryQueryKey() } });
  const filters = useGetCatalogFilters({ query: { queryKey: getGetCatalogFiltersQueryKey() } });
  const promotions = useGetPromotions({ query: { queryKey: getGetPromotionsQueryKey() } });
  const [classLevel, setClassLevel] = useState<number>();
  const [subject, setSubject] = useState('');
  const params = useMemo(() => ({ ...(classLevel ? { classLevel } : {}), ...(subject ? { subject } : {}), limit: 12 }), [classLevel, subject]);
  const books = useListBooks(params, { query: { queryKey: getListBooksQueryKey(params) } });
  const addMutation = useAddCartItem();
  const cache = useQueryClient();
  const [added, setAdded] = useState<string | null>(null);
  const [addingBundle, setAddingBundle] = useState<string | null>(null);
  const { user } = useSafeUser();
  const addBook = (book: Book) => addMutation.mutate({ data: { bookId: book.id, quantity: 1 } }, {
    onSuccess: () => { setAdded(book.id); void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }); window.setTimeout(() => setAdded(null), 1300); },
  });
  const addBundle = async (bundleKey: string, bundleBooks: Book[]) => {
    setAddingBundle(bundleKey);
    try {
      for (const book of bundleBooks) await addMutation.mutateAsync({ data: { bookId: book.id, quantity: 1 } });
      void cache.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch {
      // The shared mutation error state below explains any partial failure.
    } finally {
      setAddingBundle(null);
    }
  };
  const allFiltersError = filters.isError || promotions.isError || books.isError;
  if (filters.isLoading || promotions.isLoading || books.isLoading) return <AppShell active="/shop"><Busy /></AppShell>;
  if (allFiltersError) return <AppShell active="/shop"><ErrorState retry={() => { void filters.refetch(); void promotions.refetch(); void books.refetch(); }} /></AppShell>;
  return <AppShell active="/shop">
    <div className="welcome-line"><span>GOOD MORNING, {(user?.firstName || 'FAMILY').toUpperCase()}</span><span className="secure-note"><ShieldCheck size={15} /> A better school year starts here</span></div>
    <section className="shop-hero">
      <div className="shop-hero-copy"><span className="eyebrow">READY WHEN THE BELL RINGS</span><h1>Letâ€™s get your<br /><em>school list</em> sorted.</h1><p>Books, bundles and the little details that make a big school year.</p><Link className="button button-cream" href="/search">Browse all books <ArrowRight size={16} /></Link></div>
      <div className="shop-hero-photo"><img src="/books-editorial.jpg" alt="Colorful school books and stationery" /><div className="hero-photo-caption"><span>THE NEW TERM EDIT</span><b>Big ideas<br />begin here.</b></div><span className="photo-index">01 / 03</span></div>
      <div className="hero-side-note"><span>BOOKS FOR</span><b>Class<br />1â€”12</b><GraduationCap size={20} /></div>
    </section>
    <section className="promotions-section">
      <div className="section-head"><div><span className="eyebrow">A GOOD DEAL ON A GREAT START</span><h2>Offers for your book list</h2></div><div className="scroll-hint">SWIPE TO EXPLORE <ArrowRight size={14} /></div></div>
      {promotions.data?.length ? <div className="promo-carousel">{promotions.data.map((promo, index) => <PromotionCard key={promo.id} promo={promo} index={index} />)}</div> : <div className="quiet-empty">New school-year offers are on their way.</div>}
    </section>
    <section className="class-section">
      <div className="section-head"><div><span className="eyebrow">PICK UP WHERE YOU ARE</span><h2>Shop by class</h2></div><p className="section-aside">{summary.data?.classCount ?? '12'} grades, all in one place.</p></div>
      <div className="class-scroller"><button className={`class-tile class-all ${!classLevel ? 'class-selected' : ''}`} onClick={() => setClassLevel(undefined)} data-testid="button-class-all"><span>ALL</span><b>Classes</b><small>Browse everything</small></button>{filters.data?.classes?.map((grade) => <button key={grade.level} className={`class-tile ${classLevel === grade.level ? 'class-selected' : ''}`} onClick={() => setClassLevel(grade.level)} data-testid={`button-class-${grade.level}`}><span>{String(grade.level).padStart(2, '0')}</span><b>{grade.label}</b><small>{grade.bookCount} titles</small></button>)}</div>
    </section>
    <section className="subjects-section"><div className="section-head"><div><span className="eyebrow">ONE SUBJECT AT A TIME</span><h2>Or browse a subject</h2></div></div><div className="subject-chips"><button onClick={() => setSubject('')} className={!subject ? 'active-chip' : ''} data-testid="button-subject-all">All subjects</button>{filters.data?.subjects?.map((s) => <button key={s.name} onClick={() => setSubject(subject === s.name ? '' : s.name)} className={subject === s.name ? 'active-chip' : ''} data-testid={`button-subject-${s.name.toLowerCase().replace(/\s+/g, '-')}`}>{s.name}<span>{s.bookCount}</span></button>)}</div></section>
    <SubjectBundles books={books.data || []} addBundle={addBundle} addingBundle={addingBundle} />
    <section className="books-section"><div className="section-head"><div><span className="eyebrow">{classLevel ? `CLASS ${classLevel}` : subject || 'HAND-PICKED FOR THE CLASSROOM'}</span><h2>{subject ? `${subject} favourites` : classLevel ? `Books for Class ${classLevel}` : 'Popular this week'}</h2></div><Link href="/search" className="text-link">See all titles <ArrowRight size={15} /></Link></div>
      {addMutation.isError && <div className="inline-error" role="alert">We couldnâ€™t add that title just now. Please try once more.</div>}
      {!books.data?.length ? <EmptyState title="No titles in this corner yet." text="Try another class or subject to find your books." action="Browse all books" /> : <div className="book-grid">{books.data.map((book) => <BookCard key={book.id} book={book} add={() => addBook(book)} adding={addMutation.isPending && addMutation.variables?.data.bookId === book.id} added={added === book.id} />)}</div>}
      <div className="collection-note"><span className="collection-mark"><BookOpen size={22} /></span><div><b>Every book has a place on the list.</b><small>{summary.data?.bookCount ?? 'Hundreds of'} carefully selected titles, ready for the new term.</small></div><Link href="/search" className="round-arrow" aria-label="Browse collection"><ArrowRight size={17} /></Link></div>
    </section>
  </AppShell>;
}

function PromotionCard({ promo, index }: { promo: Promotion; index: number }) {
  return <Link href="/search?dealOnly=true" className={`promo-card promo-tone-${index % 3}`} style={promo.background ? { backgroundColor: promo.background } : undefined} data-testid={`card-promotion-${promo.id}`}>
    <div className="promo-card-art"><img src={promo.imageUrl || '/books-editorial.jpg'} alt="" onError={(event) => { event.currentTarget.src = '/books-editorial.jpg'; }} /><span className="promo-number">0{index + 1}</span></div>
    <div className="promo-card-copy"><span className="eyebrow">{promo.eyebrow}</span><h3>{promo.title}</h3><p>{promo.subtitle}</p><span className="promo-offer">{promo.discount}% OFF <ArrowUpRight size={14} /></span></div>
  </Link>;
}

function SubjectBundles({ books, addBundle, addingBundle }: { books: Book[]; addBundle: (key: string, books: Book[]) => void; addingBundle: string | null }) {
  const bundles = useMemo(() => {
    const grouped = new Map<string, Book[]>();
    books.forEach((book) => {
      const key = `${book.classLevel}-${book.subject}`;
      grouped.set(key, [...(grouped.get(key) || []), book]);
    });
    return [...grouped.entries()].filter(([, group]) => group.length > 1).slice(0, 3);
  }, [books]);
  if (!bundles.length) return null;
  return <section className="bundles-section"><div className="section-head"><div><span className="eyebrow">A FEW GOOD BOOKS, TOGETHER</span><h2>Build a subject bundle</h2></div><span className="bundle-caption">Add the set in one go.</span></div><div className="bundle-row">{bundles.map(([key, items]) => {
    const total = items.reduce((sum, book) => sum + book.price, 0);
    return <article className="bundle-card" key={key}><div className="bundle-head"><span className="bundle-icon"><BookMarked size={18} /></span><span className="bundle-grade">CLASS {items[0].classLevel}</span></div><h3>{items[0].subject}<br /><em>starter bundle</em></h3><div className="bundle-books">{items.slice(0, 3).map((book) => <span key={book.id}>{book.title}</span>)}</div><div className="bundle-buy"><span><b>{money(total)}</b><small>{items.length} titles</small></span><button onClick={() => addBundle(key, items)} disabled={addingBundle === key} data-testid={`button-add-bundle-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{addingBundle === key ? <LoaderCircle size={16} className="spin" /> : <>Add bundle <Plus size={15} /></>}</button></div></article>;
  })}</div></section>;
}

function BookCard({ book, add, adding, added }: { book: Book; add: () => void; adding?: boolean; added?: boolean }) {
  return <article className="book-card" data-testid={`card-book-${book.id}`}>
    <div className="book-art"><img src={book.imageUrl || '/books-editorial.jpg'} alt={book.title} loading="lazy" onError={(event) => { event.currentTarget.src = '/books-editorial.jpg'; }} />{book.badge && <span className="book-badge">{book.badge}</span>}<button className="favorite-btn" aria-label={`Save ${book.title}`} onClick={(event) => { event.currentTarget.classList.toggle('hearted'); }} data-testid={`button-save-${book.id}`}><Heart size={16} /></button></div>
    <div className="book-info"><div className="book-meta"><span>CLASS {book.classLevel}</span><span>{book.subject}</span></div><h3>{book.title}</h3><p>{book.author}</p><div className="book-rating"><Star size={13} fill="currentColor" /><b>{book.rating?.toFixed(1) ?? '4.8'}</b><span>Â·</span><span>{book.inStock ? 'In stock' : 'Available soon'}</span></div><div className="book-buy"><div><b>{money(book.price)}</b>{book.originalPrice > book.price && <del>{money(book.originalPrice)}</del>}</div><button className={`add-button ${added ? 'added' : ''}`} onClick={add} disabled={!book.inStock || adding} data-testid={`button-add-${book.id}`} aria-label={`Add ${book.title} to cart`}>{adding ? <LoaderCircle size={17} className="spin" /> : added ? <Check size={17} /> : <Plus size={18} />}</button></div></div>
  </article>;
}

function SearchPage() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [classLevel, setClassLevel] = useState<number | undefined>(params.has('classLevel') ? Number(params.get('classLevel')) : undefined);
  const [subject, setSubject] = useState(params.get('subject') || '');
  const filters = useGetCatalogFilters({ query: { queryKey: getGetCatalogFiltersQueryKey() } });
  const reqParams = useMemo(() => ({ ...(q.trim() ? { q: q.trim() } : {}), ...(classLevel ? { classLevel } : {}), ...(subject ? { subject } : {}), ...(params.get('dealOnly') === 'true' ? { dealOnly: true } : {}), limit: 30 }), [q, classLevel, subject]);
  const books = useListBooks(reqParams, { query: { queryKey: getListBooksQueryKey(reqParams) } });
  const cart = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const addMutation = useAddCartItem();
  const cache = useQueryClient();
  const submitSearch = (event: FormEvent) => { event.preventDefault(); setLocation(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`); };
  if (filters.isError) return <AppShell active="/search"><ErrorState retry={() => { void filters.refetch(); }} /></AppShell>;
  return <AppShell active="/search"><PageHeading kicker="YOUR NEXT GREAT FIND" title="Find the right books." text="Search by title, author or subject. Use filters to narrow the list."><span className="result-count">{books.data?.length ?? 0} titles</span></PageHeading>
    <form className="search-form" onSubmit={submitSearch}><Search size={20} /><input aria-label="Search books" placeholder="Try â€˜Mathematicsâ€™ or an author name" value={q} onChange={(e) => setQ(e.target.value)} data-testid="input-search-books" /><button type="submit">Search <ArrowRight size={16} /></button></form>
    <div className="filter-row"><span className="filter-label"><SlidersHorizontal size={15} /> FILTER BY</span><select value={classLevel || ''} onChange={(e) => setClassLevel(e.target.value ? Number(e.target.value) : undefined)} aria-label="Filter by class" data-testid="select-class"><option value="">All classes</option>{filters.data?.classes?.map((grade) => <option key={grade.level} value={grade.level}>{grade.label}</option>)}</select><select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject" data-testid="select-subject"><option value="">All subjects</option>{filters.data?.subjects?.map((s) => <option value={s.name} key={s.name}>{s.name}</option>)}</select><button className="clear-filters" onClick={() => { setClassLevel(undefined); setSubject(''); setQ(''); }} type="button">Clear filters</button></div>
    {addMutation.isError && <div className="inline-error" role="alert">We couldnâ€™t add that title just now. Please try once more.</div>}
    {books.isLoading ? <Busy label="Searching the shelves" /> : books.isError ? <ErrorState retry={() => { void books.refetch(); }} /> : books.data?.length ? <div className="book-grid search-grid">{books.data.map((book) => <BookCard key={book.id} book={book} add={() => addMutation.mutate({ data: { bookId: book.id, quantity: 1 } }, { onSuccess: () => { void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }); } })} adding={addMutation.isPending && addMutation.variables?.data.bookId === book.id} />)}</div> : <EmptyState title="Nothing on this shelf." text="Try a shorter search or clear a filter to see more books." action="See all books" />}
  </AppShell>;
}

function CartPage() {
  const cartQuery = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const cache = useQueryClient();
  const update = useUpdateCartItem(); const remove = useRemoveCartItem(); const createOrder = useCreateOrder();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ customerName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '' });
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const cart = cartQuery.data;
  const updateQty = (id: string, quantity: number) => update.mutate({ bookId: id, data: { quantity } }, { onSuccess: () => void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }) });
  const removeItem = (id: string) => remove.mutate({ bookId: id }, { onSuccess: () => void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }) });
  const submitCheckout = (event: FormEvent) => {
    event.preventDefault();
    createOrder.mutate({ data: { ...form, paymentMethod: 'cash_on_delivery' } }, {
      onSuccess: (order) => { setPlacedOrder(order.id); void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }); void cache.invalidateQueries({ queryKey: getListOrdersQueryKey() }); },
    });
  };
  if (cartQuery.isLoading) return <AppShell active="/cart"><Busy label="Gathering your basket" /></AppShell>;
  if (cartQuery.isError) return <AppShell active="/cart"><ErrorState retry={() => { void cartQuery.refetch(); }} /></AppShell>;
  if (placedOrder) return <AppShell active="/cart"><div className="order-success"><span className="success-check"><Check size={27} /></span><span className="eyebrow">ORDER CONFIRMED</span><h1>Thatâ€™s a wrap.<br /><em>See you at the door.</em></h1><p>Your books are on their way. Weâ€™ll collect payment when they arrive.</p><div className="success-order">ORDER <b>#{placedOrder.slice(-8).toUpperCase()}</b></div><Link className="button button-primary" href={`/orders/${placedOrder}`}>Track your order <ArrowRight size={16} /></Link><Link className="text-link" href="/shop">Keep browsing</Link></div></AppShell>;
  if (!cart?.items?.length) return <AppShell active="/cart"><PageHeading kicker="YOUR BASKET" title="A little room for books." text="The good stuff you add will appear here." /><EmptyState title="Your basket is waiting." text="Start with a class or subject and build your school list." action="Browse the shelves" /></AppShell>;
  return <AppShell active="/cart"><PageHeading kicker="YOUR BASKET" title="Books in the making." text={`${cart.itemCount} ${cart.itemCount === 1 ? 'book' : 'books'} on your list.`} /><div className="cart-layout"><div className="cart-lines">{(update.isError || remove.isError) && <div className="inline-error" role="alert">Your basket could not be updated. Please try again.</div>}{cart.items.map(({ book, quantity, lineTotal }) => <article className="cart-line" key={book.id}><div className="cart-book-cover"><img src={book.imageUrl || '/books-editorial.jpg'} alt={book.title} /></div><div className="cart-book-details"><div className="eyebrow">CLASS {book.classLevel} Â· {book.subject}</div><h3>{book.title}</h3><p>{book.author}</p><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => quantity > 1 ? updateQty(book.id, quantity - 1) : removeItem(book.id)} data-testid={`button-quantity-minus-${book.id}`}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => updateQty(book.id, Math.min(20, quantity + 1))} data-testid={`button-quantity-plus-${book.id}`}><Plus size={14} /></button></div></div><div className="cart-line-end"><b>{money(lineTotal)}</b><button className="remove-link" onClick={() => removeItem(book.id)} data-testid={`button-remove-${book.id}`}>Remove</button></div></article>)}
      <Link href="/shop" className="continue-link"><ArrowLeft size={15} /> Continue shopping</Link></div><aside className="summary-card"><span className="eyebrow">ORDER SUMMARY</span><div className="summary-row"><span>Books ({cart.itemCount})</span><b>{money(cart.subtotal)}</b></div><div className="summary-row"><span>Delivery</span><b className="delivery-included">On us</b></div><div className="summary-total"><span>Total</span><b>{money(cart.subtotal)}</b></div><button className="button button-primary checkout-button" onClick={() => setCheckout(!checkout)} data-testid="button-checkout">{checkout ? 'Checkout details' : 'Proceed to checkout'} <ArrowRight size={16} /></button><div className="payment-note"><ShieldCheck size={16} /> Secure checkout Â· Cash on delivery</div>
      {checkout && <form className="checkout-form" onSubmit={submitCheckout}><h3>Where should we send them?</h3>{(['customerName','phone','addressLine','city','state','postalCode'] as const).map((name) => <label key={name}>{({ customerName: 'Full name', phone: 'Phone number', addressLine: 'Street address', city: 'City', state: 'State', postalCode: 'Postal code' })[name]}<input required minLength={name === 'customerName' || name === 'city' || name === 'state' ? 2 : name === 'addressLine' ? 5 : name === 'phone' ? 10 : 5} maxLength={name === 'phone' ? 16 : name === 'postalCode' ? 10 : undefined} type={name === 'phone' || name === 'postalCode' ? 'tel' : 'text'} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} data-testid={`input-${name}`} /></label>)}{createOrder.isError && <p className="form-error">We couldnâ€™t place your order. Check your details and try again.</p>}<button className="button button-primary checkout-button" disabled={createOrder.isPending} type="submit">{createOrder.isPending ? 'Placing your orderâ€¦' : `Place order Â· ${money(cart.subtotal)}`}</button></form>}</aside></div></AppShell>;
}

function OrdersPage() {
  const orders = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  return <AppShell active="/orders"><PageHeading kicker="THE JOURNEY SO FAR" title="Your orders." text="All the books youâ€™ve brought home, in one place." />{orders.isLoading ? <Busy label="Finding your orders" /> : orders.isError ? <ErrorState retry={() => { void orders.refetch(); }} /> : orders.data?.length ? <div className="orders-list">{orders.data.map((order) => <OrderCard order={order} key={order.id} />)}</div> : <EmptyState title="Your story starts with a book." text="Once you place an order, youâ€™ll find updates and delivery details here." action="Explore the books" to="/shop" />}</AppShell>;
}
function OrderCard({ order }: { order: Order }) {
  return <Link href={`/orders/${order.id}`} className="order-card" data-testid={`card-order-${order.id}`}><div className="order-card-head"><span className={`status-pill status-${order.status}`}>{order.status}</span><span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><ArrowUpRight size={16} /></div><div className="order-card-items"><div className="order-thumbs">{order.items.slice(0, 3).map((item) => <img src={item.imageUrl || '/books-editorial.jpg'} key={item.bookId} alt="" />)}</div><div><b>{order.items[0]?.title}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}</b><small>{order.itemCount} books &middot; Cash on delivery</small></div></div><div className="order-card-foot"><span>Order <b>#{order.id.slice(-8).toUpperCase()}</b></span><strong>{money(order.total)}</strong></div></Link>;
}

const RETURN_REASONS = [
  'Damaged or defective book',
  'Wrong book received',
  'Book not as described',
  'Changed my mind',
  'Found a better price',
  'Other',
];

function ReturnModal({ item, onClose }: { item: { bookId: string; title: string; imageUrl: string; quantity: number; unitPrice: number; lineTotal: number }; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // UI-only: simulate a return submission
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="return-modal-backdrop" onClick={onClose}>
        <div className="return-modal" onClick={(e) => e.stopPropagation()}>
          <button className="return-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          <div className="return-success">
            <span className="return-success-icon"><Check size={24} /></span>
            <h3>Return request submitted</h3>
            <p>We've received your return request for <b>{item.title}</b>. You'll receive pickup details within 24–48 hours.</p>
            <div className="return-success-detail">
              <span>RETURN ID</span>
              <b>#{item.bookId.slice(-6).toUpperCase()}-R</b>
            </div>
            <button className="button button-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="return-modal-backdrop" onClick={onClose}>
      <div className="return-modal" onClick={(e) => e.stopPropagation()}>
        <button className="return-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="return-modal-header">
          <span className="return-modal-icon"><RotateCcw size={20} /></span>
          <div>
            <span className="eyebrow">RETURN REQUEST</span>
            <h3>Return this book</h3>
          </div>
        </div>

        <div className="return-modal-item">
          <img src={item.imageUrl || '/books-editorial.jpg'} alt={item.title} />
          <div>
            <b>{item.title}</b>
            <small>{item.quantity} × {money(item.unitPrice)}</small>
          </div>
          <strong>{money(item.lineTotal)}</strong>
        </div>

        <form className="return-form" onSubmit={handleSubmit}>
          <label className="return-form-label">
            Why are you returning this?
            <div className="return-reason-grid">
              {RETURN_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`return-reason-chip ${reason === r ? 'return-reason-selected' : ''}`}
                  onClick={() => setReason(r)}
                >
                  {reason === r && <Check size={12} />}
                  {r}
                </button>
              ))}
            </div>
          </label>

          <label className="return-form-label">
            <span className="return-notes-label"><MessageSquare size={13} /> Additional details (optional)</span>
            <textarea
              className="return-notes"
              placeholder="Tell us more about the issue…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>

          <div className="return-form-footer">
            <div className="return-refund-note">
              <ShieldCheck size={15} />
              <span>Refund of <b>{money(item.lineTotal)}</b> will be processed within 5–7 business days after pickup.</span>
            </div>
            <button
              type="submit"
              className="button button-primary return-submit-btn"
              disabled={!reason}
            >
              Submit return request <ArrowRight size={15} />
            </button>
            <button type="button" className="return-cancel-link" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailPage() {
  const params = useRouteParams();
  const orderId = params.orderId || '';
  const orderQuery = useGetOrder(orderId, { query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) } });
  
  // For testing the UI: force the status to be 'delivered' on whatever order is loaded
  const order = orderQuery.data ? { ...orderQuery.data, status: 'delivered' as const } : undefined;

  const [returnItem, setReturnItem] = useState<{ bookId: string; title: string; imageUrl: string; quantity: number; unitPrice: number; lineTotal: number } | null>(null);
  const [returnedItems, setReturnedItems] = useState<Set<string>>(new Set());

  const handleReturnClose = () => {
    if (returnItem) {
      setReturnedItems((prev) => new Set(prev).add(returnItem.bookId));
    }
    setReturnItem(null);
  };

  if (orderQuery.isLoading) return <AppShell active="/orders"><Busy label="Loading your order details" /></AppShell>;
  if (orderQuery.isError || !order) return <AppShell active="/orders"><ErrorState retry={() => { void orderQuery.refetch(); }} /></AppShell>;
  const steps = ['placed', 'processing', 'shipped', 'delivered'];
  const isDelivered = order.status === 'delivered';
  const isShippedOrDelivered = order.status === 'shipped' || order.status === 'delivered';

  return <AppShell active="/orders">
    <Link href="/orders" className="back-link"><ArrowLeft size={15} /> All orders</Link>
    <PageHeading kicker={`ORDER #${order.id.slice(-8).toUpperCase()}`} title="On its way to you." text={`Placed ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`}>
      <span className={`status-pill status-${order.status}`}>{order.status}</span>
    </PageHeading>
    <div className="detail-layout">
      <section className="detail-main">
        <div className="tracking-card">
          <div className="tracking-top"><span className="eyebrow">DELIVERY PROGRESS</span><PackageCheck size={21} /></div>
          <div className="tracking-steps">{steps.map((step, index) => { const current = steps.indexOf(order.status); return <div className={`tracking-step ${index <= current ? 'step-done' : ''}`} key={step}><span>{index < current ? <Check size={13} /> : index + 1}</span><small>{step}</small></div>; })}</div>
          <div className="tracking-line" />
        </div>
        <div className="detail-items">
          <h2>In this parcel</h2>
          {order.items.map((item) => (
            <div className="detail-item" key={item.bookId}>
              <img src={item.imageUrl || '/books-editorial.jpg'} alt={item.title} />
              <div>
                <b>{item.title}</b>
                <small>{item.quantity} × {money(item.unitPrice)}</small>
                {returnedItems.has(item.bookId) && (
                  <span className="return-status-pill">Return requested</span>
                )}
              </div>
              <div className="detail-item-end">
                <strong>{money(item.lineTotal)}</strong>
                {isShippedOrDelivered && !returnedItems.has(item.bookId) && (
                  <button
                    className="return-item-btn"
                    onClick={() => setReturnItem(item)}
                    data-testid={`button-return-${item.bookId}`}
                  >
                    <RotateCcw size={13} /> Return
                  </button>
                )}
                {returnedItems.has(item.bookId) && (
                  <span className="return-item-badge">
                    <Check size={11} /> Submitted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {isShippedOrDelivered && (
          <div className="return-info-card">
            <div className="return-info-icon"><RotateCcw size={18} /></div>
            <div className="return-info-text">
              <b>Easy returns</b>
              <small>Changed your mind? You can return any book within 7 days of delivery. Just hit the Return button above.</small>
            </div>
          </div>
        )}
      </section>
      <aside className="summary-card address-card">
        <span className="eyebrow">DELIVERING TO</span>
        <h3>{order.customerName}</h3>
        <p>{order.addressLine}<br />{order.city}, {order.state} {order.postalCode}</p>
        <div className="address-divider" />
        <span className="eyebrow">PAYMENT</span>
        <p>Cash on delivery<br />{order.phone}</p>
        <div className="summary-total"><span>Order total</span><b>{money(order.total)}</b></div>
      </aside>
    </div>
    {returnItem && <ReturnModal item={returnItem} onClose={handleReturnClose} />}
  </AppShell>;
}
function useRouteParams(): { orderId?: string } {
  // Wouter exposes params through its hook; this stable wrapper keeps detail routing focused.
  const [location] = useLocation();
  const match = location.match(/\/orders\/([^/?]+)/);
  return { orderId: match?.[1] ? decodeURIComponent(match[1]) : undefined };
}

function ProfilePage() {
  const { user, isLoaded } = useSafeUser();
  const orders = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const [, setLocation] = useLocation();
  const name = user?.fullName || user?.firstName || 'Book Bazaar reader';
  const handleSignOut = () => {
    setLocation('/');
  };
  return <AppShell active="/profile"><PageHeading kicker="YOUR BOOK BAZAAR" title="A little about you." text="Your account, your orders, your school-year essentials." /><div className="profile-layout"><section className="profile-card"><div className="profile-avatar">{isLoaded ? (user?.firstName?.slice(0,1) || 'B') : 'â€¦'}</div><div><span className="eyebrow">SIGNED IN AS</span><h2>{name}</h2><p>{user?.primaryEmailAddress?.emailAddress || ''}</p></div><span className="verified-mark"><ShieldCheck size={16} /> Verified account</span></section><section className="profile-quick"><Link href="/orders" className="profile-action"><span className="profile-action-icon"><ClipboardList size={19} /></span><span><b>Your orders</b><small>{orders.data?.length || 0} orders placed</small></span><ChevronRight size={17} /></Link><Link href="/cart" className="profile-action"><span className="profile-action-icon"><ShoppingBag size={19} /></span><span><b>Your basket</b><small>Pick up where you left off</small></span><ChevronRight size={17} /></Link><button className="profile-action logout-action" onClick={handleSignOut} data-testid="button-sign-out"><span className="profile-action-icon"><LogOut size={19} /></span><span><b>Sign out</b><small>See you again soon</small></span><ChevronRight size={17} /></button></section><div className="profile-help"><CircleHelp size={18} /><span><b>Need a hand?</b><small>Weâ€™re happy to help with your order or book list.</small></span><a href="mailto:hello@bookbazaar.in" className="text-link">Get in touch <ArrowUpRight size={14} /></a></div></div></AppShell>;
}

function NotFound() {
  return <AppShell active="/shop"><div className="not-found"><span className="eyebrow">PAGE NOT FOUND</span><h1>Looks like this<br /><em>shelf is empty.</em></h1><Link href="/shop" className="button button-primary">Back to the bookshop <ArrowRight size={16} /></Link></div></AppShell>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  return <TooltipProvider><WouterRouter base={basePath}><RoutedErrorBoundary><AppRoutes /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider>;
}
export default App;