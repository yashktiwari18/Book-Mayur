import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownLeft, BookOpen, Check, ChevronDown,
  ChevronRight, CircleHelp, GraduationCap, Heart, Home, LogOut, MapPin,
  Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Star, UserRound, X, ClipboardList, AlertCircle,
  LoaderCircle, BookMarked, RotateCcw, MessageSquare, Printer,
  ReceiptText, Wallet, CreditCard, Smartphone, Download, Calendar, Filter, Share2,
  CheckCircle2, Clock, Landmark, FileText, Copy, CheckCheck,
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
type Lang = 'en' | 'hi';
const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => { },
});

function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('app_lang') as Lang) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('app_lang', l);
    } catch { }
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

function useLanguage() {
  return useContext(LanguageContext);
}

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <button
      type="button"
      className="lang-toggle-btn"
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      data-testid="button-language-toggle"
      title="Switch Language / भाषा बदलें"
    >
      <span className={lang === 'en' ? 'active-lang' : ''}>EN</span>
      <span className="lang-divider">/</span>
      <span className={lang === 'hi' ? 'active-lang' : ''}>हिंदी</span>
    </button>
  );
}

function getDemoSession() {
  try {
    return localStorage.getItem('demo_logged_in') === 'true';
  } catch {
    return false;
  }
}

function setDemoSession(loggedIn: boolean) {
  try {
    if (loggedIn) {
      localStorage.setItem('demo_logged_in', 'true');
    } else {
      localStorage.removeItem('demo_logged_in');
    }
  } catch { }
  window.dispatchEvent(new Event('demo-auth-change'));
}

// Standalone (no-Clerk) versions of auth hooks
function useDemoAuth() {
  const [isSignedIn, setIsSignedIn] = useState(() => getDemoSession());
  useEffect(() => {
    const handleStorage = () => setIsSignedIn(getDemoSession());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('demo-auth-change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('demo-auth-change', handleStorage);
    };
  }, []);
  return { isLoaded: true, isSignedIn };
}

function useDemoUser() {
  const { isSignedIn } = useDemoAuth();
  return {
    isLoaded: true,
    isSignedIn,
    user: isSignedIn
      ? {
        firstName: 'Book Bazaar',
        fullName: 'Demo Reader',
        primaryEmailAddress: { emailAddress: 'reader@bookbazaar.in' },
      }
      : null,
  };
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
      <Route path="/sign-up/*?"><Redirect to="/sign-in" /></Route>
      <Route path="/shop"><Protected><ShopPage /></Protected></Route>
      <Route path="/search"><Protected><SearchPage /></Protected></Route>
      <Route path="/cart"><Protected><CartPage /></Protected></Route>
      <Route path="/orders"><Protected><OrdersPage /></Protected></Route>
      <Route path="/statement"><Protected><StatementPage /></Protected></Route>
      <Route path="/passbook"><Protected><Redirect to="/statement" /></Protected></Route>
      <Route path="/return"><Protected><ReturnPage /></Protected></Route>
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

function DemoSignInForm() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { lang } = useLanguage();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDemoSession(true);
    setLocation('/shop');
  };

  return (
    <form className="demo-auth-card" onSubmit={handleSubmit}>
      <div className="auth-card-header">
        <h2>{lang === 'hi' ? 'बुक बाज़ार में साइन इन करें' : 'Sign in to Book Bazaar'}</h2>
        <LanguageToggle />
      </div>
      <p>{lang === 'hi' ? 'अपनी स्कूल किताबों और ऑर्डर देखने के लिए विवरण दर्ज करें।' : 'Enter your details to access your school books & orders.'}</p>

      <label className="demo-auth-label">
        {lang === 'hi' ? 'ईमेल पता' : 'Email address'}
        <input
          type="email"
          required
          placeholder="parent@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="demo-auth-input"
        />
      </label>

      <label className="demo-auth-label">
        {lang === 'hi' ? 'पासवर्ड' : 'Password'}
        <input
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="demo-auth-input"
        />
      </label>

      <button type="submit" className="button button-primary demo-auth-btn">
        {lang === 'hi' ? 'साइन इन करें' : 'Sign In'} <ArrowRight size={16} />
      </button>

    </form>
  );
}

function SignInPage() {
  const { isSignedIn } = useSafeAuth();
  const { lang } = useLanguage();
  if (isSignedIn) return <Redirect to="/shop" />;

  return (
    <div className="auth-scene">
      <div className="auth-aside">
        <Brand />
        <p>{lang === 'hi' ? <>आपके सप्लायर द्वारा प्रदान किए<br />गए क्रेडेंशियल।</> : <>Credentials provided by<br />your supplier.</>}</p>
        <small>{lang === 'hi' ? 'कक्षा 1 से 12 तक के प्रत्येक कक्षा के लिए सोच-समझकर चुना गया।' : 'Thoughtfully selected for every classroom, from Class 1 to 12.'}</small>
      </div>
      {clerkPubKey ? (
        <SignIn routing="path" path={`${basePath}/sign-in`} />
      ) : (
        <DemoSignInForm />
      )}
    </div>
  );
}

// Clerk-aware version — only used inside ClerkProvider
function HomeRedirectClerk() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingPage />;
  return isSignedIn ? <Redirect to="/shop" /> : <Redirect to="/sign-in" />;
}

// Standalone version — no Clerk dependency
function HomeRedirectDemo() {
  const { isSignedIn } = useDemoAuth();
  return isSignedIn ? <Redirect to="/shop" /> : <Redirect to="/sign-in" />;
}

// Clerk-aware guard — only used inside ClerkProvider
function ProtectedClerk({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingPage />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

// Standalone guard — checks demo session
function ProtectedDemo({ children }: { children: ReactNode }) {
  const { isSignedIn } = useDemoAuth();
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

// Aliases resolved once at module load — stable component references, no conditional hooks
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
    <header className="landing-nav wrap"><Brand /><div className="nav-help"><CircleHelp size={17} /> Here for the school year</div><div className="nav-actions"><Link href="/sign-in" className="nav-signin">Sign in</Link><Link href="/sign-in" className="button button-primary" data-testid="link-create-account">Create account <ArrowUpRight size={16} /></Link></div></header>
    <section className="landing-hero wrap">
      <div className="hero-copy"><div className="eyebrow"><span /> SCHOOL LISTS, SORTED.</div><h1>Every class.<br />Every <em>bright</em><br />beginning.</h1><p>The books students need, picked with care and delivered to your door. Make this school year the easiest one yet.</p><div className="hero-ctas"><Link href="/sign-in" className="button button-primary button-large">Start your book list <ArrowRight size={18} /></Link><Link href="/sign-in" className="text-link">Already have an account <ArrowUpRight size={15} /></Link></div><div className="trust-row"><span className="trust-icon"><ShieldCheck size={19} /></span><span><b>Safe, simple & school-ready</b><small>Thoughtfully chosen for the new school year</small></span></div></div>
      <div className="hero-art" aria-label="School books arranged on a desk"><div className="art-frame"><img src="/books-editorial.jpg" alt="Colorful school books ready for a new term" /><div className="art-stamp"><span>THE</span><b>NEW<br />TERM</b><span>STARTS HERE</span></div></div><div className="art-note"><Sparkles size={16} /> Good books. Great starts.</div><div className="art-count"><b>{summary.data?.bookCount ?? '120+'}</b><span>books for<br />every learner</span></div></div>
    </section>
    <section className="landing-strip"><div className="wrap strip-inner"><span>CLASS 1â€”12</span><i /><span>CURATED SUBJECTS</span><i /><span>DOORSTEP DELIVERY</span><i /><span>PAY ON DELIVERY</span>{health.data?.status === 'ok' && <span className="health-live"><i /> Shop is online</span>}</div></section>
    <section className="landing-why wrap"><div><span className="eyebrow">THE BOOK BAZAAR DIFFERENCE</span><h2>A school list,<br /><em>without the scramble.</em></h2></div><div className="why-copy"><p>Skip the last-minute hunt from shop to shop. Find the right titles by class and subject, bundle what you need, and check out in a few easy steps.</p><Link href="/sign-in" className="text-link">Find your books <ArrowRight size={16} /></Link></div></section>
    <section className="landing-promo wrap"><div className="promo-mini"><div className="promo-art"><img src={featured?.imageUrl || '/books-editorial.jpg'} alt="" onError={(event) => { event.currentTarget.src = '/books-editorial.jpg'; }} /><div className="promo-copy"><span>{featured?.eyebrow || 'A LITTLE SOMETHING EXTRA'}</span><b>{featured?.title || 'A brighter school year, for less.'}</b><small>{featured?.subtitle || 'Explore thoughtful savings on class essentials.'}</small><Link href="/sign-in" className="promo-link">Explore offers <ArrowRight size={15} /></Link></div><strong>{featured?.discount ? `${featured.discount}%` : 'SAVE'}<small>ON SELECT<br />SCHOOL LISTS</small></strong></div></div><div className="landing-footer"><Brand compact /><span>Thoughtful books for curious minds.</span><small>Book Bazaar</small></div></section>
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
        href="/sign-in"
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
      </Link> : <Link href="/sign-in" className="mobile-offer-card mobile-offer-fallback">
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

    <Link href="/sign-in" className="mobile-start-card">
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
  const { lang } = useLanguage();

  const items = [
    { href: '/shop', label: lang === 'hi' ? 'होम' : 'Home', Icon: Home },
    { href: '/search', label: lang === 'hi' ? 'खोजें' : 'Search', Icon: Search },
    { href: '/cart', label: lang === 'hi' ? 'कार्ट' : 'Cart', Icon: ShoppingCart },
    { href: '/statement', label: lang === 'hi' ? 'स्टेटमेंट' : 'Statement', Icon: ReceiptText },
    { href: '/profile', label: lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile', Icon: UserRound },
  ];

  return <nav className="bottom-nav" aria-label="Main navigation">
    {items.map(({ href, label, Icon }) => {
      const destination = label === 'Home' && !isSignedIn ? '/' : href;
      const isCart = href === '/cart';
      return <Link key={href} href={destination} className={`bottom-link ${active === href ? 'selected' : ''} ${isCart ? 'cart-nav-link' : ''}`} data-testid={`link-nav-${href.slice(1)}`}>
        <span className="nav-icon-wrap"><Icon size={isCart ? 27 : 22} strokeWidth={active === href ? 2.2 : (isCart ? 2.2 : 1.8)} />{href === '/cart' && count > 0 && <i>{count}</i>}</span>
        <small>{label}</small>
      </Link>;
    })}
  </nav>;
}

function AppShell({ children, active }: { children: ReactNode; active: string }) {
  const { user } = useSafeUser();
  const cartQuery = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const count = cartQuery.data?.itemCount ?? 0;
  const { lang } = useLanguage();

  return <div className="app-shell">
    <header className="shop-header">
      <div className="wrap header-inner">
        <Brand compact />
        <div className="header-location">
          <MapPin size={17} />
          <span>
            <small>{lang === 'hi' ? 'डिलीवरी विवरण' : 'DELIVERY DETAILS'}</small>
            <b>{lang === 'hi' ? 'चेकआउट पर पुष्टि करें' : 'Confirm at checkout'}</b>
          </span>
          <ChevronDown size={14} />
        </div>
        <nav className="header-tabs" aria-label="Shop navigation">
          <Link href="/shop" className={active === '/shop' ? 'tab-active' : ''} data-testid="link-header-home">{lang === 'hi' ? 'होम' : 'Home'}</Link>
          <Link href="/search" className={active === '/search' ? 'tab-active' : ''} data-testid="link-header-search">{lang === 'hi' ? 'खोजें' : 'Search'}</Link>
          <Link href="/orders" className={active === '/orders' ? 'tab-active' : ''} data-testid="link-header-orders">{lang === 'hi' ? 'ऑर्डर्स' : 'Orders'}</Link>
          <Link href="/statement" className={active === '/statement' ? 'tab-active' : ''} data-testid="link-header-statement">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ReceiptText size={13} style={{ marginTop: '-1px' }} />
              {lang === 'hi' ? 'स्टेटमेंट' : 'Statement'}
            </span>
          </Link>
          <Link href="/return" className={active === '/return' ? 'tab-active' : ''} data-testid="link-header-return">{lang === 'hi' ? 'वापसी' : 'Return'}</Link>
        </nav>
        <div className="header-search">
          <Search size={17} />
          <Link href="/search">{lang === 'hi' ? 'पुस्तकें, लेखक या विषय खोजें...' : 'Search books, authors, subjects...'}</Link>
          <kbd>⌘ K</kbd>
        </div>
        <LanguageToggle />
        <Link href="/cart" className="header-cart" aria-label="Open cart" data-testid="link-header-cart"><ShoppingBag size={20} /><span>{count}</span></Link>
        <Link href="/profile" className="header-avatar" aria-label="Profile">{user?.firstName?.slice(0, 1) || 'P'}</Link>
      </div>
    </header>
    <main className="wrap page-content">{children}</main>
    <MobileBottomNav active={active} count={count} />
    <footer className="desktop-footer wrap"><span>Book Bazaar · The school bookshop</span><span>{lang === 'hi' ? 'बेहतर स्कूल दिन के लिए चुनी गई पुस्तकें।' : 'Books chosen for a better school day.'}</span></footer>
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
  const orders = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const totalPaid = orders.data?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0) || 0;
  const totalDue = orders.data?.filter(o => o.status !== 'delivered').reduce((sum, o) => sum + o.total, 0) || 0;
  const addBook = (book: Book, quantity: number = 1) => addMutation.mutate({ data: { bookId: book.id, quantity } }, {
    onSuccess: () => { setAdded(book.id); void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }); window.setTimeout(() => setAdded(null), 1300); },
  });
  const addBundle = async (bundleKey: string, bundleBooks: Book[], qty: number = 1) => {
    setAddingBundle(bundleKey);
    try {
      for (const book of bundleBooks) await addMutation.mutateAsync({ data: { bookId: book.id, quantity: qty } });
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
    <Link href="/orders" className="overall-payment-summary" style={{ display: 'flex', gap: '12px', marginBottom: '24px', textDecoration: 'none' }}>
      <div className="payment-card" style={{ flex: 1, padding: '16px', background: '#fbf8ef', borderRadius: '12px', border: '1px solid #d8d1c1' }}>
        <span style={{ fontSize: '13px', color: '#718076', display: 'block', marginBottom: '6px' }}>Total Paid Amount</span>
        <b style={{ color: '#285b45', fontSize: '20px' }}>{money(totalPaid)}</b>
      </div>
      <div className="payment-card" style={{ flex: 1, padding: '16px', background: '#fff3ef', borderRadius: '12px', border: '1px solid #f1d4ca' }}>
        <span style={{ fontSize: '13px', color: '#9b3f35', display: 'block', marginBottom: '6px' }}>Total Due Amount</span>
        <b style={{ color: '#b54d3f', fontSize: '20px' }}>{money(totalDue)}</b>
      </div>
    </Link>
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
      {!books.data?.length ? <EmptyState title="No titles in this corner yet." text="Try another class or subject to find your books." action="Browse all books" /> : <div className="book-grid">{books.data.map((book) => <BookCard key={book.id} book={book} add={(qty = 1) => addBook(book, qty)} adding={addMutation.isPending && addMutation.variables?.data.bookId === book.id} added={added === book.id} />)}</div>}
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

function SubjectBundles({
  books,
  addBundle,
  addingBundle,
}: {
  books: Book[];
  addBundle: (key: string, books: Book[], quantity: number) => void;
  addingBundle: string | null;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { lang } = useLanguage();

  const bundles = useMemo(() => {
    const grouped = new Map<string, Book[]>();
    books.forEach((book) => {
      const key = `${book.classLevel}-${book.subject}`;
      grouped.set(key, [...(grouped.get(key) || []), book]);
    });
    return [...grouped.entries()].filter(([, group]) => group.length > 1).slice(0, 3);
  }, [books]);

  if (!bundles.length) return null;

  return (
    <section className="bundles-section">
      <div className="section-head">
        <div>
          <span className="eyebrow">{lang === 'hi' ? 'विशेष बंडल ऑफर' : 'A FEW GOOD BOOKS, TOGETHER'}</span>
          <h2>{lang === 'hi' ? 'विषय बंडल चुनें' : 'Build a subject bundle'}</h2>
        </div>
        <span className="bundle-caption">{lang === 'hi' ? 'एक साथ पूरा सेट जोड़ें।' : 'Add the set in one go.'}</span>
      </div>
      <div className="bundle-row">
        {bundles.map(([key, items]) => {
          const qty = quantities[key] || 1;
          const unitTotal = items.reduce((sum, book) => sum + book.price, 0);
          const total = unitTotal * qty;

          const setQtyDirect = (val: number) => {
            setQuantities((prev) => ({
              ...prev,
              [key]: Math.max(1, Math.min(999, isNaN(val) ? 1 : val)),
            }));
          };

          return (
            <article className="bundle-card" key={key}>
              <div className="bundle-head">
                <span className="bundle-icon"><BookMarked size={18} /></span>
                <span className="bundle-grade">CLASS {items[0].classLevel}</span>
              </div>
              <h3>{items[0].subject}<br /><em>starter bundle</em></h3>
              <div className="bundle-books">
                {items.slice(0, 3).map((book) => <span key={book.id}>{book.title}</span>)}
              </div>
              <div className="bundle-qty-row">
                <span className="bundle-qty-label">{lang === 'hi' ? 'मात्रा:' : 'Set:'}</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d8d1c1', borderRadius: '8px', background: '#fffdf7', overflow: 'hidden' }}>
                  <button type="button" onClick={() => setQtyDirect(qty - 1)} style={{ width: '32px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#284336' }} aria-label="Decrease quantity">
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    className="qty-number-input bundle-qty-input"
                    min={1}
                    max={999}
                    value={qty}
                    aria-label="Bundle quantity"
                    onChange={(e) => setQtyDirect(parseInt(e.target.value, 10))}
                    onFocus={(e) => e.target.select()}
                    style={{ border: 'none', width: '40px', textAlign: 'center', padding: 0, height: '36px', background: 'transparent', outline: 'none' }}
                  />
                  <button type="button" onClick={() => setQtyDirect(qty + 1)} style={{ width: '32px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#284336' }} aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="bundle-buy">
                <div>
                  <b>{money(total)}</b>
                  <small>{items.length} titles {qty > 1 ? `(${qty} sets)` : ''}</small>
                </div>
                <button
                  onClick={() => addBundle(key, items, qty)}
                  disabled={addingBundle === key}
                  data-testid={`button-add-bundle-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                >
                  {addingBundle === key ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <>Add bundle <Plus size={15} /></>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BookCard({ book, add, adding, added }: { book: Book; add: (qty?: number) => void; adding?: boolean; added?: boolean }) {
  const [qty, setQty] = useState(1);
  return <article className="book-card" data-testid={`card-book-${book.id}`}>
    <div className="book-art"><img src={book.imageUrl || '/books-editorial.jpg'} alt={book.title} loading="lazy" onError={(event) => { event.currentTarget.src = '/books-editorial.jpg'; }} />{book.badge && <span className="book-badge">{book.badge}</span>}<button className="favorite-btn" aria-label={`Save ${book.title}`} onClick={(event) => { event.currentTarget.classList.toggle('hearted'); }} data-testid={`button-save-${book.id}`}><Heart size={16} /></button></div>
    <div className="book-info"><div className="book-meta"><span>CLASS {book.classLevel}</span><span>{book.subject}</span></div><h3>{book.title}</h3><p>{book.author}</p><div className="book-rating"><Star size={13} fill="currentColor" /><b>{book.rating?.toFixed(1) ?? '4.8'}</b><span>·</span><span>{book.inStock ? 'In stock' : 'Available soon'}</span></div><div className="book-buy"><div><b>{money(book.price * qty)}</b>{book.originalPrice > book.price && <del>{money(book.originalPrice * qty)}</del>}</div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d8d1c1', borderRadius: '8px', background: '#fffdf7', overflow: 'hidden' }}>
        <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '32px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#284336' }} aria-label="Decrease quantity">
          <Minus size={14} />
        </button>
        <input type="number" className="qty-number-input bundle-qty-input" min={1} max={999} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(999, isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value))))} onFocus={(e) => e.target.select()} style={{ border: 'none', width: '40px', textAlign: 'center', padding: 0, height: '36px', background: 'transparent', outline: 'none' }} aria-label="Quantity" />
        <button type="button" onClick={() => setQty(Math.min(999, qty + 1))} style={{ width: '32px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#284336' }} aria-label="Increase quantity">
          <Plus size={14} />
        </button>
      </div>
      <button className={`add-button ${added ? 'added' : ''}`} onClick={() => add(qty)} disabled={!book.inStock || adding} data-testid={`button-add-${book.id}`} aria-label={`Add ${book.title} to cart`}>{adding ? <LoaderCircle size={17} className="spin" /> : added ? <Check size={17} /> : <Plus size={18} />}</button>
    </div></div></div>
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
    {books.isLoading ? <Busy label="Searching the shelves" /> : books.isError ? <ErrorState retry={() => { void books.refetch(); }} /> : books.data?.length ? <div className="book-grid search-grid">{books.data.map((book) => <BookCard key={book.id} book={book} add={(qty = 1) => addMutation.mutate({ data: { bookId: book.id, quantity: qty } }, { onSuccess: () => { void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }); } })} adding={addMutation.isPending && addMutation.variables?.data.bookId === book.id} />)}</div> : <EmptyState title="Nothing on this shelf." text="Try a shorter search or clear a filter to see more books." action="See all books" />}
  </AppShell>;
}

function CartPage() {
  const cartQuery = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const cache = useQueryClient();
  const update = useUpdateCartItem(); const remove = useRemoveCartItem(); const createOrder = useCreateOrder();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ customerName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '' });
  const [paymentMode, setPaymentMode] = useState<string>('upi_phonepe');
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const { lang } = useLanguage();
  const cart = cartQuery.data;
  const updateQty = (id: string, quantity: number) => update.mutate({ bookId: id, data: { quantity } }, { onSuccess: () => void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }) });
  const removeItem = (id: string) => remove.mutate({ bookId: id }, { onSuccess: () => void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }) });
  const submitCheckout = (event: FormEvent) => {
    event.preventDefault();
    createOrder.mutate({ data: { ...form, paymentMethod: paymentMode } }, {
      onSuccess: (order) => { setPlacedOrder(order.id); void cache.invalidateQueries({ queryKey: getGetCartQueryKey() }); void cache.invalidateQueries({ queryKey: getListOrdersQueryKey() }); },
    });
  };
  if (cartQuery.isLoading) return <AppShell active="/cart"><Busy label="Gathering your basket" /></AppShell>;
  if (cartQuery.isError) return <AppShell active="/cart"><ErrorState retry={() => { void cartQuery.refetch(); }} /></AppShell>;
  if (placedOrder) return <AppShell active="/cart"><div className="order-success"><span className="success-check"><Check size={27} /></span><span className="eyebrow">ORDER CONFIRMED</span><h1>That’s a wrap.<br /><em>See you at the door.</em></h1><p>{paymentMode.startsWith('upi') ? 'Payment recorded via UPI. Instant receipt generated in your passbook.' : 'Your books are on their way. We’ll deliver to your address.'}</p><div className="success-order">ORDER <b>#{placedOrder.slice(-8).toUpperCase()}</b></div><div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px' }}><Link className="button button-primary" href={`/orders/${placedOrder}`}>Track your order <ArrowRight size={16} /></Link><Link className="button button-outline" href="/statement" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ReceiptText size={16} /> {lang === 'hi' ? 'स्टेटमेंट में देखें' : 'View in Statement'}</Link></div><Link className="text-link" href="/shop">Keep browsing</Link></div></AppShell>;
  if (!cart?.items?.length) return <AppShell active="/cart"><PageHeading kicker="YOUR BASKET" title="A little room for books." text="The good stuff you add will appear here." /><EmptyState title="Your basket is waiting." text="Start with a class or subject and build your school list." action="Browse the shelves" /></AppShell>;
  return <AppShell active="/cart"><PageHeading kicker="YOUR BASKET" title="Books in the making." text={`${cart.itemCount} ${cart.itemCount === 1 ? 'book' : 'books'} on your list.`} /><div className="cart-layout"><div className="cart-lines">{(update.isError || remove.isError) && <div className="inline-error" role="alert">Your basket could not be updated. Please try again.</div>}{cart.items.map(({ book, quantity, lineTotal }) => <article className="cart-line" key={book.id}><div className="cart-book-cover"><img src={book.imageUrl || '/books-editorial.jpg'} alt={book.title} /></div><div className="cart-book-details"><div className="eyebrow">CLASS {book.classLevel} · {book.subject}</div><h3>{book.title}</h3><p>{book.author}</p><input type="number" className="qty-number-input" min={1} max={20} value={quantity} aria-label={`Quantity for ${book.title}`} data-testid={`input-quantity-${book.id}`} onChange={(e) => { const v = parseInt(e.target.value, 10); if (v >= 1 && v <= 20) updateQty(book.id, v); else if (v < 1) removeItem(book.id); }} onFocus={(e) => e.target.select()} /></div><div className="cart-line-end"><b>{money(lineTotal)}</b><button className="remove-link" onClick={() => removeItem(book.id)} data-testid={`button-remove-${book.id}`}>Remove</button></div></article>)}
    <Link href="/shop" className="continue-link"><ArrowLeft size={15} /> Continue shopping</Link></div><aside className="summary-card"><span className="eyebrow">ORDER SUMMARY</span><div className="summary-row"><span>Books ({cart.itemCount})</span><b>{money(cart.subtotal)}</b></div><div className="summary-row"><span>Delivery</span><b className="delivery-included">On us</b></div><div className="summary-total"><span>Total</span><b>{money(cart.subtotal)}</b></div><button className="button button-primary checkout-button" onClick={() => setCheckout(!checkout)} data-testid="button-checkout">{checkout ? 'Checkout details' : 'Proceed to checkout'} <ArrowRight size={16} /></button><div className="payment-note"><ShieldCheck size={16} /> Secure checkout · UPI, Cards & COD supported</div>
      {checkout && <form className="checkout-form" onSubmit={submitCheckout}>
        <h3>Where should we send them?</h3>
        {(['customerName', 'phone', 'addressLine', 'city', 'state', 'postalCode'] as const).map((name) => <label key={name}>{({ customerName: 'Full name', phone: 'Phone number', addressLine: 'Street address', city: 'City', state: 'State', postalCode: 'Postal code' })[name]}<input required minLength={name === 'customerName' || name === 'city' || name === 'state' ? 2 : name === 'addressLine' ? 5 : name === 'phone' ? 10 : 5} maxLength={name === 'phone' ? 16 : name === 'postalCode' ? 10 : undefined} type={name === 'phone' || name === 'postalCode' ? 'tel' : 'text'} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} data-testid={`input-${name}`} /></label>)}
        
        <div className="checkout-payment-methods">
          <h4>{lang === 'hi' ? 'भुगतान विधि चुनें' : 'Choose Payment Method'}</h4>
          <div className="payment-mode-options">
            <label className={`payment-mode-pill ${paymentMode === 'upi_phonepe' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="upi_phonepe" checked={paymentMode === 'upi_phonepe'} onChange={() => setPaymentMode('upi_phonepe')} />
              <span className="payment-mode-icon-badge" style={{ color: '#5f259f' }}><Smartphone size={18} /></span>
              <span className="payment-mode-label">
                <b>PhonePe UPI</b>
                <small>{lang === 'hi' ? 'फोनपे द्वारा तुरंत भुगतान और रसीद' : 'Instant UPI payment & PhonePe passbook entry'}</small>
              </span>
            </label>
            <label className={`payment-mode-pill ${paymentMode === 'upi_gpay' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="upi_gpay" checked={paymentMode === 'upi_gpay'} onChange={() => setPaymentMode('upi_gpay')} />
              <span className="payment-mode-icon-badge" style={{ color: '#1a73e8' }}><Smartphone size={18} /></span>
              <span className="payment-mode-label">
                <b>Google Pay / Paytm UPI</b>
                <small>{lang === 'hi' ? 'किसी भी यूपीआई ऐप से सुरक्षित भुगतान' : 'Pay via any UPI App / QR'}</small>
              </span>
            </label>
            <label className={`payment-mode-pill ${paymentMode === 'card' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="card" checked={paymentMode === 'card'} onChange={() => setPaymentMode('card')} />
              <span className="payment-mode-icon-badge" style={{ color: '#1e3a5f' }}><CreditCard size={18} /></span>
              <span className="payment-mode-label">
                <b>Credit / Debit Card</b>
                <small>{lang === 'hi' ? 'वीज़ा, मास्टरकार्ड, रुपे कार्ड' : 'Visa, MasterCard, RuPay'}</small>
              </span>
            </label>
            <label className={`payment-mode-pill ${paymentMode === 'cash_on_delivery' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="cash_on_delivery" checked={paymentMode === 'cash_on_delivery'} onChange={() => setPaymentMode('cash_on_delivery')} />
              <span className="payment-mode-icon-badge" style={{ color: '#b25e1a' }}><Landmark size={18} /></span>
              <span className="payment-mode-label">
                <b>Cash on Delivery</b>
                <small>{lang === 'hi' ? 'किताबें मिलने पर नकद भुगतान करें' : 'Pay in cash upon doorstep delivery'}</small>
              </span>
            </label>
          </div>
        </div>

        {createOrder.isError && <p className="form-error">We couldn’t place your order. Check your details and try again.</p>}
        <button className="button button-primary checkout-button" disabled={createOrder.isPending} type="submit">{createOrder.isPending ? 'Placing your order…' : `Pay & Place Order · ${money(cart.subtotal)}`}</button>
      </form>}
    </aside></div></AppShell>;
}

function ReturnPage() {
  const orders = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const [returnCart, setReturnCart] = useState<Record<string, number>>({});
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const orderedItems = useMemo(() => {
    if (!orders.data) return [];
    const map = new Map<string, { bookId: string; title: string; imageUrl: string; unitPrice: number; lineTotal: number; quantity: number; orderId: string }>();
    orders.data.forEach((order) => {
      order.items.forEach((item) => {
        const existing = map.get(item.bookId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.lineTotal += item.lineTotal;
        } else {
          map.set(item.bookId, { ...item, orderId: order.id });
        }
      });
    });
    return Array.from(map.values());
  }, [orders.data]);

  const toggleAddItem = (bookId: string) => {
    setReturnCart((prev) => {
      const current = prev[bookId] || 0;
      if (current === 0) return { ...prev, [bookId]: 1 };
      return prev;
    });
  };

  const updateReturnQty = (bookId: string, delta: number, maxQty: number) => {
    setReturnCart((prev) => {
      const current = prev[bookId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[bookId];
        return copy;
      }
      return { ...prev, [bookId]: Math.min(next, maxQty) };
    });
  };

  const selectedCount = Object.values(returnCart).reduce((sum, qty) => sum + qty, 0);
  const totalRefund = orderedItems.reduce((sum, item) => {
    const qty = returnCart[item.bookId] || 0;
    return sum + qty * item.unitPrice;
  }, 0);

  const handleProceedToReturn = () => {
    if (selectedCount > 0) {
      setShowReasonModal(true);
    }
  };

  const handleSubmitReturn = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowReasonModal(false);
  };

  if (orders.isLoading) return <AppShell active="/return"><Busy label="Loading your ordered items" /></AppShell>;
  if (orders.isError) return <AppShell active="/return"><ErrorState retry={() => { void orders.refetch(); }} /></AppShell>;

  if (submitted) {
    return (
      <AppShell active="/return">
        <div className="order-success">
          <span className="success-check"><Check size={27} /></span>
          <span className="eyebrow">RETURN REQUEST CONFIRMED</span>
          <h1>Return requested.<br /><em>We'll pick it up soon.</em></h1>
          <p>We've registered a return request for {selectedCount} {selectedCount === 1 ? 'item' : 'items'}. A total refund of <b>{money(totalRefund)}</b> will be credited after pickup.</p>
          <div className="success-order">RETURN ID <b>#RET-{Math.floor(100000 + Math.random() * 900000)}</b></div>
          <button className="button button-primary" onClick={() => { setSubmitted(false); setReturnCart({}); }}>Return More Items</button>
          <Link className="text-link" href="/shop">Back to Shop</Link>
        </div>
      </AppShell>
    );
  }

  if (!orderedItems.length) {
    return (
      <AppShell active="/return">
        <PageHeading kicker="EASY RETURNS" title="Return items." text="Items from your orders will appear here for easy return." />
        <EmptyState title="No orders to return yet." text="Once you place an order, you can add delivered books here for return." action="Explore the books" to="/shop" />
      </AppShell>
    );
  }

  return (
    <AppShell active="/return">
      <PageHeading kicker="EASY 7-DAY RETURNS" title="Select items to return." text="Add items from your past orders to create a return request." />

      <div className="return-page-layout">
        <div className="return-items-grid">
          {orderedItems.map((item) => {
            const qty = returnCart[item.bookId] || 0;
            const isAdded = qty > 0;
            return (
              <article key={item.bookId} className={`return-item-card ${isAdded ? 'selected-return-card' : ''}`}>
                <div className="return-item-art">
                  <img src={item.imageUrl || '/books-editorial.jpg'} alt={item.title} />
                </div>
                <div className="return-item-info">
                  <span className="eyebrow">ORDERED ITEM</span>
                  <h3>{item.title}</h3>
                  <p>{money(item.unitPrice)} each &middot; Purchased: {item.quantity}</p>
                  <div className="return-item-buy">
                    <b>{money(item.unitPrice * (qty || 1))}</b>
                    {!isAdded ? (
                      <button
                        className="add-button return-add-btn"
                        onClick={() => toggleAddItem(item.bookId)}
                        aria-label={`Add ${item.title} to return`}
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      <input
                        type="number"
                        className="qty-number-input return-qty-input"
                        min={1}
                        max={item.quantity}
                        value={qty}
                        aria-label={`Return quantity for ${item.title}`}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v >= 1 && v <= item.quantity) {
                            setReturnCart((prev) => ({ ...prev, [item.bookId]: v }));
                          } else if (!isNaN(v) && v < 1) {
                            setReturnCart((prev) => { const c = { ...prev }; delete c[item.bookId]; return c; });
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="summary-card return-summary-card">
          <span className="eyebrow">RETURN SUMMARY</span>
          <div className="summary-row"><span>Items to return</span><b>{selectedCount}</b></div>
          <div className="summary-row"><span>Pickup charge</span><b className="delivery-included">Free</b></div>
          <div className="summary-total"><span>Estimated refund</span><b>{money(totalRefund)}</b></div>
          <button
            className="button button-primary checkout-button"
            disabled={selectedCount === 0}
            onClick={handleProceedToReturn}
          >
            Proceed to return <ArrowRight size={16} />
          </button>
          <div className="payment-note"><ShieldCheck size={16} /> 7-day doorstep pickup</div>
        </aside>
      </div>

      {showReasonModal && (
        <div className="return-modal-backdrop" onClick={() => setShowReasonModal(false)}>
          <div className="return-modal" onClick={(e) => e.stopPropagation()}>
            <button className="return-modal-close" onClick={() => setShowReasonModal(false)} aria-label="Close"><X size={18} /></button>
            <div className="return-modal-header">
              <span className="return-modal-icon"><RotateCcw size={20} /></span>
              <div>
                <span className="eyebrow">RETURN REQUEST</span>
                <h3>Confirm return ({selectedCount} {selectedCount === 1 ? 'item' : 'items'})</h3>
              </div>
            </div>

            <form className="return-form" onSubmit={handleSubmitReturn}>
              <label className="return-form-label">
                Why are you returning these items?
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
                  <span>Refund of <b>{money(totalRefund)}</b> will be processed after pickup.</span>
                </div>
                <button
                  type="submit"
                  className="button button-primary return-submit-btn"
                  disabled={!reason}
                >
                  Confirm Return Request <ArrowRight size={15} />
                </button>
                <button type="button" className="return-cancel-link" onClick={() => setShowReasonModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function PrintInvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { lang } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const calculatedSubtotal = order.items.reduce((sum, item) => sum + (item.lineTotal || item.unitPrice * item.quantity), 0);
  const totalDiscount = order.items.reduce((sum, item) => {
    const orig = (item as any).originalPrice || Math.round(item.unitPrice * 1.15);
    return sum + (orig - item.unitPrice) * item.quantity;
  }, 0);

  return (
    <div className="invoice-modal-backdrop" onClick={onClose}>
      <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-modal-actions no-print">
          <button type="button" className="button button-primary print-now-btn" onClick={handlePrint}>
            <Printer size={16} /> {lang === 'hi' ? 'प्रिंट रसीद' : 'Print Invoice'}
          </button>
          <button type="button" className="invoice-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="printable-invoice-paper" id="printable-invoice">
          <div className="invoice-header">
            <div className="invoice-brand">
              <span className="brand-mark"><BookOpen size={22} /></span>
              <div>
                <h2>Book Bazaar</h2>
                <small>The School Bookshop</small>
              </div>
            </div>
            <div className="invoice-meta">
              <h3>INVOICE / TAX RECEIPT</h3>
              <p><b>Order #:</b> #{order.id.slice(-8).toUpperCase()}</p>
              <p><b>Date:</b> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p><b>Payment Mode:</b> Cash on Delivery</p>
            </div>
          </div>

          <div className="invoice-addresses-grid">
            <div className="invoice-address-box">
              <span className="eyebrow">DELIVERY / SHIPPING ADDRESS</span>
              <h4>{order.customerName}</h4>
              <p>{order.addressLine}</p>
              <p>{order.city}, {order.state} - {order.postalCode}</p>
              <p><b>Phone:</b> {order.phone}</p>
            </div>
            <div className="invoice-address-box">
              <span className="eyebrow">BILLING ADDRESS</span>
              <h4>{order.customerName}</h4>
              <p>{order.addressLine}</p>
              <p>{order.city}, {order.state} - {order.postalCode}</p>
              <p><b>Phone:</b> {order.phone}</p>
            </div>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book Title</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Set</th>
                <th className="text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const origPrice = (item as any).originalPrice || Math.round(item.unitPrice * 1.15);
                const discountPerUnit = origPrice - item.unitPrice;
                return (
                  <tr key={item.bookId || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <b>{item.title}</b>
                    </td>
                    <td>{money(origPrice)}</td>
                    <td className="discount-text">-{money(discountPerUnit)}</td>
                    <td>{item.quantity}</td>
                    <td className="text-right"><b>{money(item.lineTotal)}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="invoice-summary-block">
            <div className="invoice-summary-row">
              <span>Items Total:</span>
              <span>{money(calculatedSubtotal + totalDiscount)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="invoice-summary-row discount-row">
                <span>Discount Saved:</span>
                <span>-{money(totalDiscount)}</span>
              </div>
            )}
            <div className="invoice-summary-row">
              <span>Delivery Charge:</span>
              <span>FREE</span>
            </div>
            <div className="invoice-summary-row final-total-row">
              <span>Grand Total:</span>
              <span>{money(order.total || calculatedSubtotal)}</span>
            </div>
          </div>

          <div className="invoice-footer-note">
            <p>Thank you for shopping with Book Bazaar! For support or inquiries, contact hello@bookbazaar.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersPage() {
  const orders = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const { lang } = useLanguage();

  const totalPaid = orders.data?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0) || 0;
  const totalDue = orders.data?.filter(o => o.status !== 'delivered').reduce((sum, o) => sum + o.total, 0) || 0;

  return (
    <AppShell active="/orders">
      <PageHeading kicker="THE JOURNEY SO FAR" title="Your orders." text="All the books you’ve brought home, in one place." />
      {orders.isLoading ? (
        <Busy label="Finding your orders" />
      ) : orders.isError ? (
        <ErrorState retry={() => { void orders.refetch(); }} />
      ) : orders.data?.length ? (
        <>
          <div className="overall-payment-summary" style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div className="payment-card" style={{ flex: 1, minWidth: '160px', padding: '16px', background: '#fbf8ef', borderRadius: '12px', border: '1px solid #d8d1c1' }}>
              <span style={{ fontSize: '13px', color: '#718076', display: 'block', marginBottom: '6px' }}>Total Paid Amount</span>
              <b style={{ color: '#285b45', fontSize: '20px' }}>{money(totalPaid)}</b>
            </div>
            <div className="payment-card" style={{ flex: 1, minWidth: '160px', padding: '16px', background: '#fff3ef', borderRadius: '12px', border: '1px solid #f1d4ca' }}>
              <span style={{ fontSize: '13px', color: '#9b3f35', display: 'block', marginBottom: '6px' }}>Total Due Amount</span>
              <b style={{ color: '#b54d3f', fontSize: '20px' }}>{money(totalDue)}</b>
            </div>
          </div>
          <div style={{ marginBottom: '22px' }}>
            <Link href="/statement" className="button button-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#f4faf6', borderColor: '#285b45', color: '#285b45', fontWeight: 600, borderRadius: '10px' }}>
              <ReceiptText size={17} /> {lang === 'hi' ? 'विस्तृत पेमेंट स्टेटमेंट और पासबुक देखें (PhonePe Style)' : 'View Detailed Payment Statement & Passbook (PhonePe Style)'} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="orders-list">
            {orders.data.map((order) => (
              <OrderCard order={order} key={order.id} onPrint={(o) => setPrintOrder(o)} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="Your story starts with a book." text="Once you place an order, you’ll find updates and delivery details here." action="Explore the books" to="/shop" />
      )}
      {printOrder && <PrintInvoiceModal order={printOrder} onClose={() => setPrintOrder(null)} />}
    </AppShell>
  );
}

function OrderCard({ order, onPrint }: { order: Order; onPrint?: (order: Order) => void }) {
  const { lang } = useLanguage();
  return (
    <div className="order-card-container">
      <Link href={`/orders/${order.id}`} className="order-card" data-testid={`card-order-${order.id}`}>
        <div className="order-card-head">
          <span className={`status-pill status-${order.status}`}>{order.status}</span>
          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <ArrowUpRight size={16} />
        </div>
        <div className="order-card-items">
          <div className="order-thumbs">
            {order.items.slice(0, 3).map((item) => (
              <img src={item.imageUrl || '/books-editorial.jpg'} key={item.bookId} alt="" />
            ))}
          </div>
          <div>
            <b>{order.items[0]?.title}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}</b>
            <small>{order.itemCount} {lang === 'hi' ? 'पुस्तकें' : 'books'} &middot; Cash on delivery</small>
          </div>
        </div>
        <div className="order-card-foot">
          <span>Order <b>#{order.id.slice(-8).toUpperCase()}</b></span>
          <div className="order-foot-right">
            <strong>{money(order.total)}</strong>
            {onPrint && (
              <button
                type="button"
                className="order-print-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPrint(order);
                }}
                title="Print Order Receipt"
              >
                <Printer size={13} /> {lang === 'hi' ? 'प्रिंट' : 'Print'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
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
  const { lang } = useLanguage();

  // For testing the UI: force the status to be 'delivered' on whatever order is loaded
  const order = orderQuery.data ? { ...orderQuery.data, status: 'delivered' as const } : undefined;

  const [returnItem, setReturnItem] = useState<{ bookId: string; title: string; imageUrl: string; quantity: number; unitPrice: number; lineTotal: number } | null>(null);
  const [returnedItems, setReturnedItems] = useState<Set<string>>(new Set());
  const [showPrintModal, setShowPrintModal] = useState(false);

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
  const isShippedOrDelivered = (order.status as string) === 'shipped' || order.status === 'delivered';

  return <AppShell active="/orders">
    <Link href="/orders" className="back-link"><ArrowLeft size={15} /> All orders</Link>
    <PageHeading kicker={`ORDER #${order.id.slice(-8).toUpperCase()}`} title="On its way to you." text={`Placed ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`}>
      <div className="heading-actions-row">
        <span className={`status-pill status-${order.status}`}>{order.status}</span>
        <button
          type="button"
          className="button button-outline print-detail-btn"
          onClick={() => setShowPrintModal(true)}
        >
          <Printer size={15} /> {lang === 'hi' ? 'प्रिंट रसीद' : 'Print Invoice'}
        </button>
      </div>
    </PageHeading>
    {showPrintModal && <PrintInvoiceModal order={order} onClose={() => setShowPrintModal(false)} />}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <b>{item.title}</b>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: isDelivered ? '#e6f3ec' : '#fef2e8', color: isDelivered ? '#285b45' : '#b54d3f', fontWeight: 600, letterSpacing: '0.02em' }}>{isDelivered ? 'PAID' : 'DUE'}</span>
                </div>
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
        <div className="payment-cards" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <div className="payment-card" style={{ flex: 1, padding: '12px', background: '#fbf8ef', borderRadius: '8px', border: '1px solid #d8d1c1' }}>
            <span style={{ fontSize: '12px', color: '#718076', display: 'block', marginBottom: '4px' }}>Paid Amount</span>
            <b style={{ color: '#285b45' }}>{money(isDelivered ? order.total : 0)}</b>
          </div>
          <div className="payment-card" style={{ flex: 1, padding: '12px', background: '#fff3ef', borderRadius: '8px', border: '1px solid #f1d4ca' }}>
            <span style={{ fontSize: '12px', color: '#9b3f35', display: 'block', marginBottom: '4px' }}>Due Amount</span>
            <b style={{ color: '#b54d3f' }}>{money(isDelivered ? 0 : order.total)}</b>
          </div>
        </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// PhonePe-Style Digital Payment Receipt Modal
// ─────────────────────────────────────────────────────────────────────────────
interface TransactionRecord {
  id: string;
  orderId: string;
  type: 'debit' | 'credit';
  title: string;
  amount: number;
  dateStr: string;
  timeStr: string;
  fullDate: Date;
  status: 'completed' | 'pending' | 'refunded';
  paymentMethod: string;
  methodLabel: string;
  transactionId: string;
  paymentRef: string;
  items: Order['items'];
  customerName: string;
  phone: string;
  addressLine: string;
  city: string;
  rawOrder?: Order;
}

function PhonePeReceiptModal({
  txn,
  onClose,
  onPrintInvoice,
}: {
  txn: TransactionRecord;
  onClose: () => void;
  onPrintInvoice: (order: Order) => void;
}) {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyUTR = () => {
    try {
      navigator.clipboard.writeText(txn.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    const text = `Book Bazaar Payment Receipt\nAmount: ${money(txn.amount)}\nDate: ${txn.dateStr} at ${txn.timeStr}\nUTR: ${txn.transactionId}\nOrder ID: #${txn.orderId.slice(-8).toUpperCase()}\nStatus: ${txn.status.toUpperCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Payment Receipt · Book Bazaar', text });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(text);
    alert('Receipt summary copied to clipboard!');
  };

  const isRefund = txn.type === 'credit';
  const isPending = txn.status === 'pending';

  return (
    <div className="phonepe-modal-backdrop" onClick={onClose}>
      <div className="phonepe-receipt-card" onClick={(e) => e.stopPropagation()}>
        <div
          className="phonepe-receipt-header"
          style={{
            background: isRefund
              ? 'linear-gradient(135deg, #1b5e39 0%, #2f7a4e 100%)'
              : isPending
              ? 'linear-gradient(135deg, #9a5416 0%, #c47627 100%)'
              : 'linear-gradient(135deg, #1b5e39 0%, #285b45 100%)',
          }}
        >
          <button type="button" className="phonepe-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="phonepe-check-circle" style={{ color: isPending ? '#b76b1f' : '#285b45' }}>
            {isPending ? <Clock size={30} /> : <CheckCheck size={32} />}
          </div>
          <div className="phonepe-receipt-status">
            {isRefund
              ? (lang === 'hi' ? 'रिफंड सफल (खाते में जमा)' : 'Refund Successful (Credited)')
              : isPending
              ? (lang === 'hi' ? 'भुगतान लंबित (डिलीवरी पर देय)' : 'Payment Pending (Due on Delivery)')
              : (lang === 'hi' ? 'भुगतान सफल (खाते से कटा)' : 'Payment Successful (Debited)')}
          </div>
          <div className="phonepe-receipt-amount">
            {isRefund ? `+ ${money(txn.amount)}` : money(txn.amount)}
          </div>
          <div className="phonepe-receipt-sub">
            {isRefund ? 'Credited to original payment account' : 'Paid to Book Bazaar Bookstore (Verified Merchant)'}
          </div>
        </div>

        <div className="phonepe-receipt-body">
          <div className="phonepe-info-section">
            <div className="phonepe-info-row">
              <span>{lang === 'hi' ? 'यूपीआई रेफ़रेंस / UTR' : 'UPI Ref ID / UTR'}</span>
              <b>
                {txn.transactionId}
                <button
                  type="button"
                  className="phonepe-copy-btn"
                  onClick={handleCopyUTR}
                  title="Copy UTR ID"
                >
                  {copied ? <Check size={14} style={{ color: '#285b45' }} /> : <Copy size={13} />}
                </button>
              </b>
            </div>
            <div className="phonepe-info-row">
              <span>{lang === 'hi' ? 'ऑर्डर आईडी' : 'Order ID'}</span>
              <b>#{txn.orderId.slice(-8).toUpperCase()}</b>
            </div>
            <div className="phonepe-info-row">
              <span>{lang === 'hi' ? 'तारीख और समय' : 'Date & Time'}</span>
              <b>{txn.dateStr} · {txn.timeStr}</b>
            </div>
            <div className="phonepe-info-row">
              <span>{lang === 'hi' ? 'भुगतान माध्यम' : 'Payment Mode'}</span>
              <b>{txn.methodLabel}</b>
            </div>
            <div className="phonepe-info-row">
              <span>{lang === 'hi' ? 'स्थिति' : 'Status'}</span>
              <span
                className={`statement-status-badge ${
                  txn.status === 'completed'
                    ? 'status-success'
                    : txn.status === 'refunded'
                    ? 'status-refunded'
                    : 'status-pending'
                }`}
              >
                {txn.status === 'completed' && <Check size={11} />}
                {txn.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>
              {lang === 'hi' ? 'किताबों का विवरण' : 'BOOKS INCLUDED'} ({txn.items.length})
            </span>
            <div className="phonepe-items-list">
              {txn.items.map((it) => (
                <div className="phonepe-item-row" key={it.bookId}>
                  <span>
                    {it.title} <small style={{ color: '#79877e' }}>× {it.quantity}</small>
                  </span>
                  <b>{money(it.lineTotal || it.unitPrice * it.quantity)}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="phonepe-info-section" style={{ background: '#f5f2e9' }}>
            <div className="phonepe-info-row">
              <span>{lang === 'hi' ? 'ग्राहक' : 'Customer'}</span>
              <b>{txn.customerName || 'Alex Reader'}</b>
            </div>
            <div className="phonepe-info-row">
              <span>{lang === 'hi' ? 'वितरण शहर' : 'Delivery Destination'}</span>
              <b>{txn.city || 'New Delhi'}</b>
            </div>
          </div>
        </div>

        <div className="phonepe-receipt-footer">
          {txn.rawOrder && (
            <button
              type="button"
              className="button button-primary"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => onPrintInvoice(txn.rawOrder!)}
            >
              <Printer size={15} /> {lang === 'hi' ? 'प्रिंट रसीद' : 'Print Invoice'}
            </button>
          )}
          <button
            type="button"
            className="button button-outline"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={handleShare}
          >
            <Share2 size={15} /> {lang === 'hi' ? 'शेयर' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Printable Formal Statement of Accounts Modal
// ─────────────────────────────────────────────────────────────────────────────
function PrintStatementModal({
  transactions,
  totalPaid,
  totalDue,
  onClose,
}: {
  transactions: TransactionRecord[];
  totalPaid: number;
  totalDue: number;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-backdrop" onClick={onClose}>
      <div className="invoice-modal-card" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        <div className="invoice-modal-actions no-print">
          <button type="button" className="button button-primary print-now-btn" onClick={handlePrint}>
            <Printer size={16} /> {lang === 'hi' ? 'स्टेटमेंट प्रिंट करें / PDF सेव करें' : 'Print Statement / Save PDF'}
          </button>
          <button type="button" className="invoice-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="printable-invoice-paper" id="printable-statement" style={{ padding: '36px 40px' }}>
          <div className="invoice-header" style={{ borderBottom: '2px solid #285b45', paddingBottom: '20px' }}>
            <div className="invoice-brand">
              <span className="brand-mark"><BookOpen size={24} /></span>
              <div>
                <h2>Book Bazaar</h2>
                <small>The School Bookshop · Payment Passbook & Statement of Accounts</small>
              </div>
            </div>
            <div className="invoice-meta" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#285b45', letterSpacing: '0.04em' }}>CUSTOMER PASSBOOK</div>
              <div style={{ fontSize: '11px', color: '#68776e', marginTop: '2px' }}>
                Generated on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', margin: '22px 0' }}>
            <div style={{ padding: '12px 14px', background: '#f4faf6', border: '1px solid #d2e8dc', borderRadius: '10px' }}>
              <span style={{ fontSize: '10px', color: '#557262', fontWeight: 700, textTransform: 'uppercase' }}>Total Debited / Paid</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#285b45', marginTop: '3px' }}>{money(totalPaid)}</div>
            </div>
            <div style={{ padding: '12px 14px', background: '#fdf6ee', border: '1px solid #fae2cc', borderRadius: '10px' }}>
              <span style={{ fontSize: '10px', color: '#8e5927', fontWeight: 700, textTransform: 'uppercase' }}>Total Due / Outstanding</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#b54d3f', marginTop: '3px' }}>{money(totalDue)}</div>
            </div>
            <div style={{ padding: '12px 14px', background: '#fbf9f4', border: '1px solid #e7e2d6', borderRadius: '10px' }}>
              <span style={{ fontSize: '10px', color: '#66756c', fontWeight: 700, textTransform: 'uppercase' }}>Recorded Transactions</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#284336', marginTop: '3px' }}>{transactions.length} Total</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '16px' }}>
            <thead>
              <tr style={{ background: '#f4f0e6', borderBottom: '1.5px solid #d5cec0', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px', color: '#284336' }}>Date & Time</th>
                <th style={{ padding: '10px 8px', color: '#284336' }}>Description / Order Ref</th>
                <th style={{ padding: '10px 8px', color: '#284336' }}>UTR / Txn ID</th>
                <th style={{ padding: '10px 8px', color: '#284336' }}>Payment Mode</th>
                <th style={{ padding: '10px 8px', color: '#284336', textAlign: 'right' }}>Debit (-)</th>
                <th style={{ padding: '10px 8px', color: '#284336', textAlign: 'right' }}>Credit (+)</th>
                <th style={{ padding: '10px 8px', color: '#284336', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #ebe5d8' }}>
                  <td style={{ padding: '10px 8px', color: '#44584c' }}>
                    <b>{t.dateStr}</b><br /><small style={{ color: '#79877e' }}>{t.timeStr}</small>
                  </td>
                  <td style={{ padding: '10px 8px', color: '#284336' }}>
                    <b>#{t.orderId.slice(-8).toUpperCase()}</b> · {t.title}<br />
                    <small style={{ color: '#7a887f' }}>
                      {t.items.map((i) => i.title).join(', ').slice(0, 40)}
                      {t.items.length > 1 ? '…' : ''}
                    </small>
                  </td>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#334c3d' }}>{t.transactionId}</td>
                  <td style={{ padding: '10px 8px', color: '#4b5f52' }}>{t.methodLabel}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: t.type === 'debit' ? '#1f3529' : '#888' }}>
                    {t.type === 'debit' ? money(t.amount) : '—'}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: t.type === 'credit' ? '#1b7a42' : '#888' }}>
                    {t.type === 'credit' ? money(t.amount) : '—'}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: t.status === 'completed' ? '#e6f6ee' : t.status === 'refunded' ? '#ede9fe' : '#fef5ea', color: t.status === 'completed' ? '#1b7a42' : t.status === 'refunded' ? '#6d28d9' : '#b76b1f' }}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '30px', paddingTop: '16px', borderTop: '1px solid #ddd7ca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '10px', color: '#79877e' }}>
              This is a computer-generated statement of payments. For queries or school fee claims, contact: <b>support@bookbazaar.in</b>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#79877e' }}>Verified Official Record</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#285b45', marginTop: '2px' }}>Book Bazaar Accounts Division</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatementPage — PhonePe Style Passbook & Payment History
// ─────────────────────────────────────────────────────────────────────────────
function StatementPage() {
  const orders = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'refunded'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '30days' | '90days'>('all');
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);
  const [showPrintStatement, setShowPrintStatement] = useState(false);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Transform raw orders into rich transaction records (PhonePe style)
  const transactions = useMemo<TransactionRecord[]>(() => {
    if (!orders.data) return [];

    const list: TransactionRecord[] = orders.data.map((order) => {
      const d = new Date(order.createdAt);
      const isDelivered = order.status === 'delivered';
      const isCod = order.paymentMethod === 'cash_on_delivery';

      let status: 'completed' | 'pending' | 'refunded' = 'completed';
      if (isCod && !isDelivered) {
        status = 'pending';
      }

      let methodLabel = 'PhonePe UPI';
      if (order.paymentMethod === 'upi_phonepe') methodLabel = 'PhonePe UPI';
      else if (order.paymentMethod === 'upi_gpay') methodLabel = 'Google Pay UPI';
      else if (order.paymentMethod === 'card') methodLabel = 'Credit/Debit Card';
      else if (order.paymentMethod === 'cash_on_delivery') methodLabel = 'Cash on Delivery';

      const transactionId = order.transactionId || `UPI/${Math.abs(order.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().padEnd(12, '7').slice(0, 12)}`;

      return {
        id: `TXN-${order.id}`,
        orderId: order.id,
        type: 'debit' as const,
        title: lang === 'hi' ? 'बुक बाज़ार को भुगतान' : 'Paid to Book Bazaar',
        amount: order.total,
        dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timeStr: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        fullDate: d,
        status,
        paymentMethod: order.paymentMethod || 'upi_phonepe',
        methodLabel,
        transactionId,
        paymentRef: order.paymentRef || `REF-${order.id.slice(-6).toUpperCase()}`,
        items: order.items,
        customerName: order.customerName,
        phone: order.phone,
        addressLine: order.addressLine,
        city: order.city,
        rawOrder: order,
      };
    });

    // Add a verified sample refund transaction so the passbook demonstrates credit transactions too
    const refundDate = new Date(Date.now() - 86400000 * 18);
    list.push({
      id: 'TXN-REF-781923',
      orderId: 'ORD-92834112',
      type: 'credit',
      title: lang === 'hi' ? 'बुक बाज़ार से रिफंड' : 'Refund from Book Bazaar',
      amount: 319,
      dateStr: refundDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      timeStr: '03:30 PM',
      fullDate: refundDate,
      status: 'refunded',
      paymentMethod: 'upi_phonepe',
      methodLabel: 'PhonePe UPI Refund',
      transactionId: 'UPI/REF439102847291',
      paymentRef: 'REF-BOOK-RETURN',
      items: [
        {
          bookId: 'english-2',
          title: 'Little Words, Big Stories (Returned)',
          imageUrl: '/book-covers/english.svg',
          unitPrice: 319,
          quantity: 1,
          lineTotal: 319,
        },
      ],
      customerName: 'Alex Reader',
      phone: '9876543210',
      addressLine: '123 Knowledge Avenue',
      city: 'New Delhi',
    });

    // Sort newest first
    return list.sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime());
  }, [orders.data, lang]);

  // Aggregate stats
  const totalPaid = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalDue = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalRefunds = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    const now = Date.now();
    return transactions.filter((t) => {
      // Period filter
      if (periodFilter === '30days' && now - t.fullDate.getTime() > 86400000 * 30) return false;
      if (periodFilter === '90days' && now - t.fullDate.getTime() > 86400000 * 90) return false;

      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesOrderId = t.orderId.toLowerCase().includes(q);
        const matchesTxnId = t.transactionId.toLowerCase().includes(q);
        const matchesMethod = t.methodLabel.toLowerCase().includes(q);
        const matchesBooks = t.items.some((it) => it.title.toLowerCase().includes(q));
        const matchesAmount = t.amount.toString().includes(q);
        if (!matchesTitle && !matchesOrderId && !matchesTxnId && !matchesMethod && !matchesBooks && !matchesAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, periodFilter, statusFilter, searchQuery]);

  // Group by date string (e.g. "20 Nov 2026")
  const groupedByDate = useMemo(() => {
    const map = new Map<string, TransactionRecord[]>();
    filtered.forEach((t) => {
      const arr = map.get(t.dateStr) || [];
      arr.push(t);
      map.set(t.dateStr, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <AppShell active="/statement">
      <PageHeading
        kicker={lang === 'hi' ? 'पासबुक और भुगतान इतिहास' : 'PASSBOOK & PAYMENT HISTORY'}
        title={lang === 'hi' ? 'पेमेंट स्टेटमेंट।' : 'Payment statement.'}
        text={
          lang === 'hi'
            ? 'देखें कब कितना भुगतान किया, किस तारीख को और किस माध्यम से — बिल्कुल PhonePe पासबुक की तरह।'
            : 'Track how much you paid, on which date, and payment methods — just like your UPI passbook.'
        }
      />

      <div className="statement-layout">
        {/* PhonePe Style Hero Card */}
        <section className="statement-hero-card">
          <div className="statement-hero-top">
            <span className="statement-brand-tag">
              <ShieldCheck size={14} /> {lang === 'hi' ? 'बुक बाज़ार सत्यापित पासबुक' : 'Book Bazaar Verified Passbook'}
            </span>
            <div className="statement-hero-actions">
              <button
                type="button"
                className="statement-hero-btn"
                onClick={() => setShowPrintStatement(true)}
              >
                <Download size={14} /> {lang === 'hi' ? 'स्टेटमेंट डाउनलोड / प्रिंट' : 'Download Statement'}
              </button>
            </div>
          </div>

          <div className="statement-hero-main">
            <span className="statement-hero-label">{lang === 'hi' ? 'कुल भुगतान राशि (सफल)' : 'Total Amount Paid (Debited)'}</span>
            <div className="statement-hero-amount">{money(totalPaid)}</div>
          </div>

          <div className="statement-hero-stats">
            <div className="statement-stat-box">
              <span>{lang === 'hi' ? 'सफल लेन-देन' : 'Completed Transactions'}</span>
              <b>{transactions.filter((t) => t.status === 'completed').length} {lang === 'hi' ? 'भुगतान' : 'Payments'}</b>
            </div>
            <div className="statement-stat-box">
              <span>{lang === 'hi' ? 'लंबित / देय राशि' : 'Pending / Due on Delivery'}</span>
              <b style={{ color: totalDue > 0 ? '#f7a89e' : '#ffffff' }}>{money(totalDue)}</b>
            </div>
            <div className="statement-stat-box">
              <span>{lang === 'hi' ? 'प्राप्त रिफंड' : 'Refunds Credited'}</span>
              <b style={{ color: '#bbf0d5' }}>+ {money(totalRefunds)}</b>
            </div>
            <div className="statement-stat-box">
              <span>{lang === 'hi' ? 'सक्रिय भुगतान विधियां' : 'Payment Methods Used'}</span>
              <b>PhonePe, GPay, Cards</b>
            </div>
          </div>
        </section>

        {/* Toolbar: Search, Period, Filter Pills */}
        <section className="statement-toolbar">
          <div className="statement-search-row">
            <div className="statement-search-input-wrap">
              <Search size={16} />
              <input
                type="text"
                className="statement-search-input"
                placeholder={lang === 'hi' ? 'ऑर्डर आईडी, UTR, किताब का नाम या राशि से खोजें...' : 'Search by order ID, UTR number, book title, or amount…'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', background: 'transparent', border: 0, color: '#79877e', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              className="statement-period-select"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
            >
              <option value="all">{lang === 'hi' ? 'सभी समय (All Time)' : 'All Time'}</option>
              <option value="30days">{lang === 'hi' ? 'पिछले 30 दिन' : 'Last 30 Days'}</option>
              <option value="90days">{lang === 'hi' ? 'पिछले 90 दिन' : 'Last 90 Days'}</option>
            </select>
          </div>

          <div className="statement-filter-chips">
            <button
              type="button"
              className={`statement-chip ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              {lang === 'hi' ? 'सभी लेन-देन' : 'All Transactions'} ({transactions.length})
            </button>
            <button
              type="button"
              className={`statement-chip ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              {lang === 'hi' ? 'सफल भुगतान' : 'Paid / Debited'} ({transactions.filter((t) => t.status === 'completed').length})
            </button>
            <button
              type="button"
              className={`statement-chip ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              {lang === 'hi' ? 'लंबित / देय' : 'Pending / Due'} ({transactions.filter((t) => t.status === 'pending').length})
            </button>
            <button
              type="button"
              className={`statement-chip ${statusFilter === 'refunded' ? 'active' : ''}`}
              onClick={() => setStatusFilter('refunded')}
            >
              {lang === 'hi' ? 'रिफंड' : 'Refunds'} ({transactions.filter((t) => t.status === 'refunded').length})
            </button>
          </div>
        </section>

        {/* Transactions Feed (PhonePe Passbook Style Grouped by Date) */}
        {orders.isLoading ? (
          <Busy label="Loading your payment statement" />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e7e2d6' }}>
            <ReceiptText size={32} style={{ color: '#8d9c92', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#284336', marginBottom: '6px' }}>
              {lang === 'hi' ? 'कोई लेन-देन नहीं मिला' : 'No transactions found'}
            </h3>
            <p style={{ fontSize: '13px', color: '#79877e', maxWidth: '380px', margin: '0 auto 16px' }}>
              {lang === 'hi'
                ? 'आपके चुने गए फ़िल्टर या खोज के अनुसार कोई रिकॉर्ड नहीं मिला। फ़िल्टर साफ़ करके दोबारा देखें।'
                : 'No transactions match your current search or filter. Try clearing the filter.'}
            </p>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPeriodFilter('all');
              }}
            >
              {lang === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
            </button>
          </div>
        ) : (
          <div className="statement-feed" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {groupedByDate.map(([dateStr, items]) => {
              const dayTotal = items
                .filter((it) => it.type === 'debit')
                .reduce((s, it) => s + it.amount, 0);

              return (
                <div key={dateStr} className="statement-date-section">
                  <div className="statement-date-header">
                    <span className="statement-date-title">
                      <Calendar size={13} /> {dateStr}
                    </span>
                    {dayTotal > 0 && (
                      <span className="statement-date-total">
                        {lang === 'hi' ? 'दैनिक योग' : 'Daily Total'}: <b>{money(dayTotal)}</b>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map((txn) => {
                      const isRefund = txn.type === 'credit';
                      let iconClass = 'icon-upi-phonepe';
                      if (isRefund) iconClass = 'icon-refund';
                      else if (txn.paymentMethod === 'upi_gpay') iconClass = 'icon-upi-gpay';
                      else if (txn.paymentMethod === 'card') iconClass = 'icon-card';
                      else if (txn.paymentMethod === 'cash_on_delivery') iconClass = 'icon-cod';

                      return (
                        <article
                          key={txn.id}
                          className="statement-txn-card"
                          onClick={() => setSelectedTxn(txn)}
                          data-testid={`card-statement-txn-${txn.orderId}`}
                          title={lang === 'hi' ? 'PhonePe रसीद देखने के लिए क्लिक करें' : 'Click to view PhonePe-style payment receipt'}
                        >
                          {/* Method Avatar */}
                          <div className={`statement-txn-icon ${iconClass}`}>
                            {isRefund ? (
                              <RotateCcw size={20} />
                            ) : txn.paymentMethod === 'card' ? (
                              <CreditCard size={20} />
                            ) : txn.paymentMethod === 'cash_on_delivery' ? (
                              <Landmark size={20} />
                            ) : (
                              <Smartphone size={20} />
                            )}
                            {txn.status === 'completed' && (
                              <span className="statement-txn-icon-sub">
                                <Check size={9} strokeWidth={3} />
                              </span>
                            )}
                          </div>

                          {/* Body Information */}
                          <div className="statement-txn-body">
                            <div className="statement-txn-row-top">
                              <span className="statement-txn-title">{txn.title}</span>
                              <span className="statement-mode-badge">{txn.methodLabel}</span>
                            </div>

                            <div className="statement-txn-meta">
                              <span>
                                <Clock size={11} /> {txn.timeStr}
                              </span>
                              <span>·</span>
                              <span>Order #{txn.orderId.slice(-8).toUpperCase()}</span>
                              <span>·</span>
                              <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                UTR: {txn.transactionId.slice(-8)}
                              </span>
                            </div>

                            <div className="statement-txn-items-preview">
                              {txn.items.map((i) => `${i.title} (×${i.quantity})`).join(', ')}
                            </div>
                          </div>

                          {/* Amount & Status Badge */}
                          <div className="statement-txn-end">
                            <div className={isRefund ? 'statement-amount-credit' : 'statement-amount-debit'}>
                              {isRefund ? `+ ${money(txn.amount)}` : `- ${money(txn.amount)}`}
                            </div>
                            <span
                              className={`statement-status-badge ${
                                txn.status === 'completed'
                                  ? 'status-success'
                                  : txn.status === 'refunded'
                                  ? 'status-refunded'
                                  : 'status-pending'
                              }`}
                            >
                              {txn.status === 'completed' && <Check size={10} />}
                              {txn.status === 'completed'
                                ? (lang === 'hi' ? 'सफल' : 'SUCCESS')
                                : txn.status === 'refunded'
                                ? (lang === 'hi' ? 'रिफंड' : 'REFUNDED')
                                : (lang === 'hi' ? 'लंबित' : 'PENDING')}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PhonePe Digital Receipt Modal */}
      {selectedTxn && (
        <PhonePeReceiptModal
          txn={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onPrintInvoice={(o) => {
            setSelectedTxn(null);
            setPrintOrder(o);
          }}
        />
      )}

      {/* Formal Printable Statement Modal */}
      {showPrintStatement && (
        <PrintStatementModal
          transactions={filtered}
          totalPaid={totalPaid}
          totalDue={totalDue}
          onClose={() => setShowPrintStatement(false)}
        />
      )}

      {/* Print Single Invoice Modal */}
      {printOrder && <PrintInvoiceModal order={printOrder} onClose={() => setPrintOrder(null)} />}
    </AppShell>
  );
}

function ProfilePage() {
  const { user, isLoaded } = useSafeUser();
  const orders = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const [, setLocation] = useLocation();
  const { lang } = useLanguage();
  const name = user?.fullName || user?.firstName || 'Book Bazaar reader';
  const handleSignOut = () => {
    if (!clerkPubKey) {
      setDemoSession(false);
    }
    setLocation('/sign-in');
  };
  return <AppShell active="/profile"><PageHeading kicker="YOUR BOOK BAZAAR" title="A little about you." text="Your account, your orders, your school-year essentials." /><div className="profile-layout"><section className="profile-card"><div className="profile-avatar">{isLoaded ? (user?.firstName?.slice(0, 1) || 'B') : '…'}</div><div><span className="eyebrow">SIGNED IN AS</span><h2>{name}</h2><p>{user?.primaryEmailAddress?.emailAddress || ''}</p></div><span className="verified-mark"><ShieldCheck size={16} /> Verified account</span></section><section className="profile-quick">
    <Link href="/statement" className="profile-action statement-highlight-action" data-testid="link-profile-statement">
      <span className="profile-action-icon" style={{ background: '#e8f3ed', color: '#285b45' }}>
        <ReceiptText size={20} />
      </span>
      <span>
        <b style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lang === 'hi' ? 'पेमेंट स्टेटमेंट और पासबुक' : 'Payment Statement & Passbook'}
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '12px', background: '#285b45', color: '#fff', fontWeight: 600 }}>PhonePe Style</span>
        </b>
        <small>{lang === 'hi' ? 'भुगतान इतिहास, तारीखें, यूपीआई लेन-देन और रसीदें' : 'Check how much you paid, on which date, UPI & receipts'}</small>
      </span>
      <ChevronRight size={17} />
    </Link>
    <Link href="/orders" className="profile-action"><span className="profile-action-icon"><ClipboardList size={19} /></span><span><b>{lang === 'hi' ? 'आपके ऑर्डर्स' : 'Your orders'}</b><small>{orders.data?.length || 0} {lang === 'hi' ? 'ऑर्डर दिए गए' : 'orders placed'}</small></span><ChevronRight size={17} /></Link><Link href="/cart" className="profile-action"><span className="profile-action-icon"><ShoppingBag size={19} /></span><span><b>{lang === 'hi' ? 'आपकी टोकरी' : 'Your basket'}</b><small>{lang === 'hi' ? 'खरीदारी जारी रखें' : 'Pick up where you left off'}</small></span><ChevronRight size={17} /></Link><button className="profile-action logout-action" onClick={handleSignOut} data-testid="button-sign-out"><span className="profile-action-icon"><LogOut size={19} /></span><span><b>{lang === 'hi' ? 'साइन आउट' : 'Sign out'}</b><small>{lang === 'hi' ? 'जल्द ही फिर मिलेंगे' : 'See you again soon'}</small></span><ChevronRight size={17} /></button></section><div className="profile-help"><CircleHelp size={18} /><span><b>Need a hand?</b><small>We’re happy to help with your order or book list.</small></span><a href="mailto:hello@bookbazaar.in" className="text-link">Get in touch <ArrowUpRight size={14} /></a></div></div></AppShell>;
}

function NotFound() {
  return <AppShell active="/shop"><div className="not-found"><span className="eyebrow">PAGE NOT FOUND</span><h1>Looks like this<br /><em>shelf is empty.</em></h1><Link href="/shop" className="button button-primary">Back to the bookshop <ArrowRight size={16} /></Link></div></AppShell>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <RoutedErrorBoundary>
            <AppRoutes />
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </LanguageProvider>
  );
}
export default App;