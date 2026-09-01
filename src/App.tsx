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
import { apiCheckAuth, apiLogout } from './lib/api';

type RouteState = 'public' | 'login' | 'admin';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteState>('public');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Check initial authentication once on mount
  const checkInitialAuth = async (): Promise<boolean> => {
    try {
      const res = await apiCheckAuth();
      const isAuth = Boolean(res && res.authenticated);
      setIsAuthenticated(isAuth);
      return isAuth;
    } catch {
      setIsAuthenticated(false);
      return false;
    } finally {
      setAuthChecking(false);
    }
  };

  // Determine current active route based on window.location
  const resolveRoute = (authStatus: boolean | null) => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    const isLoginPath =
      path === '/owner-login' ||
      path === '/owner-login/' ||
      hash === '#owner-login' ||
      hash === '#/owner-login';

    const isAdminPath =
      path === '/admin' ||
      path === '/admin/' ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash === '#dashboard' ||
      hash === '#/dashboard';

    if (isAdminPath) {
      if (authStatus === false) {
        // Unauthenticated visitor trying to access /admin -> redirect to /owner-login
        if (hash) {
          window.location.hash = '#/owner-login';
        } else {
          window.history.replaceState({}, '', '/owner-login');
        }
        setCurrentRoute('login');
      } else {
        setCurrentRoute('admin');
      }
    } else if (isLoginPath) {
      if (authStatus === true) {
        // Already authenticated owner visiting /owner-login -> redirect to /admin
        if (hash) {
          window.location.hash = '#/admin';
        } else {
          window.history.replaceState({}, '', '/admin');
        }
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('login');
      }
    } else {
      setCurrentRoute('public');
    }
  };

  useEffect(() => {
    checkInitialAuth().then((authStatus) => {
      resolveRoute(authStatus);
    });

    const handleLocationChange = async () => {
      // If user navigates to admin or login, verify auth status
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

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentRoute('admin');
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
    setCurrentRoute('login');
    if (window.location.hash) {
      window.location.hash = '#/owner-login';
    } else {
      window.history.pushState({}, '', '/owner-login');
    }
  };

  const handleBackToSite = () => {
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/owner-login')) {
      window.history.pushState({}, '', '/');
    }
    setCurrentRoute('public');
  };

  // If loading authentication state on admin/login route
  if (authChecking && currentRoute !== 'public') {
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
  if (currentRoute === 'admin') {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onBackToSite={handleBackToSite}
        />
      );
    }
    return (
      <AdminDashboard
        onBackToSite={handleBackToSite}
        onLogout={handleLogout}
      />
    );
  }

  // 2. OWNER LOGIN ROUTE (/owner-login)
  if (currentRoute === 'login') {
    return (
      <AdminLogin
        onSuccess={handleLoginSuccess}
        onBackToSite={handleBackToSite}
      />
    );
  }

  // 3. PUBLIC WEBSITE (Normal Visitors)
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground font-sans">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Portfolio />
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
