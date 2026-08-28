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
import { apiCheckAuth } from './lib/api';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check URL path or hash for #admin or /admin
  const checkRoute = () => {
    const isHashAdmin = window.location.hash.startsWith('#admin') || window.location.hash.startsWith('#/admin');
    const isPathAdmin = window.location.pathname.startsWith('/admin');
    setIsAdminRoute(isHashAdmin || isPathAdmin);
  };

  useEffect(() => {
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);

    // Keyboard shortcut for owner: Alt + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        window.location.hash = '#admin';
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Verify auth if admin route is active
  useEffect(() => {
    if (isAdminRoute) {
      apiCheckAuth()
        .then((auth) => setIsAuthenticated(auth))
        .catch(() => setIsAuthenticated(false));
    }
  }, [isAdminRoute]);

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
  };

  const handleBackToSite = () => {
    window.location.hash = '';
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
    setIsAdminRoute(false);
  };

  // If in admin mode
  if (isAdminRoute) {
    if (isAuthenticated === null) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground">Checking authentication…</p>
          </div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <AdminDashboard
          onBackToSite={handleBackToSite}
          onLogout={() => setIsAuthenticated(false)}
        />
      );
    }

    return (
      <AdminLogin
        onSuccess={() => setIsAuthenticated(true)}
        onBackToSite={handleBackToSite}
      />
    );
  }

  // Public Portfolio Website
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
      <Footer onOpenAdmin={handleOpenAdmin} />
    </div>
  );
}
