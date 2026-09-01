import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { Testimonials } from './components/Testimonials';
import { Toolkit } from './components/Toolkit';
import { CtaBanner } from './components/CtaBanner';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { CategoryPage } from './components/CategoryPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { apiCheckAuth, apiLogout } from './lib/api';
import { PORTFOLIO_CATEGORIES, toCategorySlug } from './lib/categories';

type RouteState =
  | { type: 'public' }
  | { type: 'login' }
  | { type: 'admin' }
  | { type: 'category'; categorySlug: string }
  | { type: 'project'; categorySlug?: string; projectSlug: string };

function getInitialRoute(): RouteState {
  if (typeof window === 'undefined') return { type: 'public' };
  try {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    const effectivePath = hash ? `/${hash}` : path || '/';

    if (effectivePath === '/owner-login' || path === '/owner-login' || hash === 'owner-login') {
      return { type: 'login' };
    }
    if (effectivePath === '/admin' || path === '/admin' || hash === 'admin' || hash === 'dashboard') {
      return { type: 'admin' };
    }
    const projectMatch =
      effectivePath.match(/^\/works\/([a-z0-9-]+)\/([a-z0-9-]+)$/) ||
      path.match(/^\/works\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (projectMatch) {
      return { type: 'project', categorySlug: projectMatch[1], projectSlug: projectMatch[2] };
    }
    const directProjectMatch =
      effectivePath.match(/^\/project\/([a-z0-9-]+)$/) ||
      path.match(/^\/project\/([a-z0-9-]+)$/);
    if (directProjectMatch) {
      return { type: 'project', projectSlug: directProjectMatch[1] };
    }
    const categoryMatch =
      effectivePath.match(/^\/works\/([a-z0-9-]+)$/) ||
      path.match(/^\/works\/([a-z0-9-]+)$/);
    if (categoryMatch) {
      return { type: 'category', categorySlug: categoryMatch[1] };
    }
  } catch (err) {
    console.error('Error determining initial route:', err);
  }
  return { type: 'public' };
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteState>(getInitialRoute);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Check initial authentication once on mount
  const checkInitialAuth = async (): Promise<boolean> => {
    try {
      const res = await apiCheckAuth();
      const isAuth = Boolean(res && res.authenticated);
      setIsAuthenticated(isAuth);
      return isAuth;
    } catch (err) {
      console.warn('Auth check error:', err);
      setIsAuthenticated(false);
      return false;
    } finally {
      setAuthChecking(false);
    }
  };

  // Determine current active route based on window.location
  const resolveRoute = (authStatus: boolean | null) => {
    try {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      const effectivePath = hash ? `/${hash}` : path || '/';

      console.log('[Routing] Resolving path:', { path, hash, effectivePath, authStatus });

      const isLoginPath =
        effectivePath === '/owner-login' ||
        path === '/owner-login' ||
        hash === 'owner-login';

      const isAdminPath =
        effectivePath === '/admin' ||
        path === '/admin' ||
        hash === 'admin' ||
        hash === 'dashboard';

      if (isAdminPath) {
        if (authStatus === false) {
          if (hash) {
            window.location.hash = '#/owner-login';
          } else {
            window.history.replaceState({}, '', '/owner-login');
          }
          setCurrentRoute({ type: 'login' });
        } else {
          setCurrentRoute({ type: 'admin' });
        }
        return;
      }

      if (isLoginPath) {
        if (authStatus === true) {
          if (hash) {
            window.location.hash = '#/admin';
          } else {
            window.history.replaceState({}, '', '/admin');
          }
          setCurrentRoute({ type: 'admin' });
        } else {
          setCurrentRoute({ type: 'login' });
        }
        return;
      }

      // Check Project Detail Route: /works/:categorySlug/:projectSlug or /project/:projectSlug
      const projectMatch =
        effectivePath.match(/^\/works\/([a-z0-9-]+)\/([a-z0-9-]+)$/) ||
        path.match(/^\/works\/([a-z0-9-]+)\/([a-z0-9-]+)$/);

      if (projectMatch) {
        setCurrentRoute({
          type: 'project',
          categorySlug: projectMatch[1],
          projectSlug: projectMatch[2],
        });
        return;
      }

      const directProjectMatch =
        effectivePath.match(/^\/project\/([a-z0-9-]+)$/) ||
        path.match(/^\/project\/([a-z0-9-]+)$/);

      if (directProjectMatch) {
        setCurrentRoute({
          type: 'project',
          projectSlug: directProjectMatch[1],
        });
        return;
      }

      // Check Category Route: /works/:categorySlug
      const categoryMatch =
        effectivePath.match(/^\/works\/([a-z0-9-]+)$/) ||
        path.match(/^\/works\/([a-z0-9-]+)$/);

      if (categoryMatch) {
        const slug = categoryMatch[1];
        // Only recognize if valid category or slug
        const isKnownCategory = PORTFOLIO_CATEGORIES.some((c) => c.slug === slug);
        if (isKnownCategory) {
          setCurrentRoute({
            type: 'category',
            categorySlug: slug,
          });
          return;
        }
      }

      // Default: Public Home View
      setCurrentRoute({ type: 'public' });
    } catch (err) {
      console.error('[Routing] Error in resolveRoute:', err);
      setCurrentRoute({ type: 'public' });
    }
  };

  useEffect(() => {
    checkInitialAuth().then((authStatus) => {
      resolveRoute(authStatus);
    });

    const handleLocationChange = async () => {
      try {
        const res = await apiCheckAuth();
        const authStatus = Boolean(res && res.authenticated);
        setIsAuthenticated(authStatus);
        resolveRoute(authStatus);
      } catch {
        setIsAuthenticated(false);
        resolveRoute(false);
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleNavigateCategory = (catSlug: string) => {
    const slug = toCategorySlug(catSlug);
    const targetUrl = `/works/${slug}`;
    if (window.location.hash) {
      window.location.hash = `#${targetUrl}`;
    } else {
      window.history.pushState({}, '', targetUrl);
    }
    setCurrentRoute({ type: 'category', categorySlug: slug });
  };

  const handleNavigateProject = (catSlug: string, projSlug: string) => {
    const slug = toCategorySlug(catSlug);
    const targetUrl = `/works/${slug}/${projSlug}`;
    if (window.location.hash) {
      window.location.hash = `#${targetUrl}`;
    } else {
      window.history.pushState({}, '', targetUrl);
    }
    setCurrentRoute({ type: 'project', categorySlug: slug, projectSlug: projSlug });
  };

  const handleNavigateHome = () => {
    if (window.location.hash) {
      window.location.hash = '';
    }
    window.history.pushState({}, '', '/');
    setCurrentRoute({ type: 'public' });
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentRoute({ type: 'admin' });
    if (window.location.hash) {
      window.location.hash = '#/admin';
    } else {
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {}
    setIsAuthenticated(false);
    setCurrentRoute({ type: 'login' });
    if (window.location.hash) {
      window.location.hash = '#/owner-login';
    } else {
      window.history.pushState({}, '', '/owner-login');
    }
  };

  // If loading authentication state on admin/login route
  if (authChecking && (currentRoute.type === 'admin' || currentRoute.type === 'login')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  // 1. OWNER ADMIN DASHBOARD (Protected)
  if (currentRoute.type === 'admin') {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onBackToSite={handleNavigateHome}
        />
      );
    }
    return (
      <AdminDashboard
        onBackToSite={handleNavigateHome}
        onLogout={handleLogout}
      />
    );
  }

  // 2. OWNER LOGIN ROUTE (/owner-login)
  if (currentRoute.type === 'login') {
    return (
      <AdminLogin
        onSuccess={handleLoginSuccess}
        onBackToSite={handleNavigateHome}
      />
    );
  }

  // 3. DEDICATED CATEGORY PAGE (/works/branding, /works/social-media, etc.)
  if (currentRoute.type === 'category') {
    return (
      <CategoryPage
        categorySlug={currentRoute.categorySlug}
        onNavigateCategory={handleNavigateCategory}
        onNavigateHome={handleNavigateHome}
        onNavigateProject={handleNavigateProject}
      />
    );
  }

  // 4. DEDICATED PROJECT DETAIL PAGE (/works/branding/jck-crypto-exchange, etc.)
  if (currentRoute.type === 'project') {
    return (
      <ProjectDetailPage
        categorySlug={currentRoute.categorySlug}
        projectSlug={currentRoute.projectSlug}
        onNavigateCategory={handleNavigateCategory}
        onNavigateHome={handleNavigateHome}
        onNavigateProject={handleNavigateProject}
      />
    );
  }

  // 5. PUBLIC HOMEPAGE (All sections)
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground font-sans">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Portfolio
          onNavigateCategory={handleNavigateCategory}
          onNavigateProject={handleNavigateProject}
        />
        <Services />
        <Process />
        <Testimonials />
        <Toolkit />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
