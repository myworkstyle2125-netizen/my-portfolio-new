import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Eye,
  FileText,
  FolderTree,
  Globe,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { AdminSettings, Category, InquiryMessage, PackageItem, Project, Testimonial } from '../../types';
import { APPROVED_CATEGORY_ITEMS, APPROVED_PROJECT_CATEGORIES } from '../../data/siteData';
import {
  apiGetCategories,
  apiGetMessages,
  apiGetPackages,
  apiGetProjects,
  apiGetSettings,
  apiGetTestimonials,
  apiLogout,
} from '../../lib/api';
import { ProjectsManager } from './ProjectsManager';
import { CategoriesManager } from './CategoriesManager';
import { MessagesManager } from './MessagesManager';
import { PackagesManager } from './PackagesManager';
import { SettingsManager } from './SettingsManager';
import { ReviewsManager } from './ReviewsManager';
import { ProjectEditorModal } from './ProjectEditorModal';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onLogout: () => void;
}

type AdminTab = 'dashboard' | 'projects' | 'categories' | 'packages' | 'messages' | 'reviews' | 'settings';

export function AdminDashboard({ onBackToSite, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>(APPROVED_CATEGORY_ITEMS as Category[]);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: 'NIFTYGRAPHY',
    tagline: 'Designing ideas into visual experiences.',
    email: 'niftygraphy24@gmail.com',
    whatsappNumber: '94759700219',
    whatsappLabel: '+94 75 970 0219',
    location: 'Colombo, Sri Lanka — working worldwide',
    bio: '',
    ownerName: 'P.D. Yadeesha Shen Perera',
  });

  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, c, m, pk, t, s] = await Promise.all([
        apiGetProjects(false).catch(() => []),
        apiGetCategories().catch(() => APPROVED_CATEGORY_ITEMS as Category[]),
        apiGetMessages().catch(() => []),
        apiGetPackages().catch(() => []),
        apiGetTestimonials(true).catch(() => []),
        apiGetSettings().catch(() => ({})),
      ]);

      const approvedCategories = (c || []).filter((item: Category) =>
        APPROVED_PROJECT_CATEGORIES.includes(item.name as any)
      );

      setProjects(p);
      setCategories(approvedCategories.length === 6 ? approvedCategories : (APPROVED_CATEGORY_ITEMS as Category[]));
      setMessages(m);
      setPackages(pk);
      setTestimonials(t);
      if (s && s.siteName) setSettings(s);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogoutClick = async () => {
    await apiLogout();
    onLogout();
  };

  const unreadMessagesCount = messages.filter((m) => !m.read).length;
  const pendingReviewsCount = testimonials.filter((t) => t.status === 'pending').length;
  const publishedCount = projects.filter((p) => p.published !== false).length;
  const draftCount = projects.filter((p) => p.published === false).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-accent selection:text-accent-foreground">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface/95 border-r border-border flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent text-accent-foreground font-display font-bold text-sm shadow-md">
              NG
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-tight text-foreground">
                {settings.siteName || 'NIFTYGRAPHY'}
              </h2>
              <p className="text-[0.68rem] text-accent font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Owner Admin Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-5 pt-5">
          <button
            type="button"
            onClick={() => {
              setQuickAddOpen(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-accent py-2.5 text-xs font-semibold text-accent-foreground shadow-md transition-transform hover:scale-102"
          >
            <Plus className="h-4 w-4" /> Add New Project
          </button>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4" /> Dashboard Overview
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('projects');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <span className="flex items-center gap-3">
              <FileText className="h-4 w-4" /> Projects & Portfolio
            </span>
            <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.65rem]">
              {projects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <span className="flex items-center gap-3">
              <Layers className="h-4 w-4" /> Categories
            </span>
            <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.65rem]">
              {categories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('packages');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'packages'
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <span className="flex items-center gap-3">
              <Package className="h-4 w-4" /> Pricing & Packages
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('messages');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <span className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4" /> Inquiries & Leads
            </span>
            {unreadMessagesCount > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-bold text-accent-foreground">
                {unreadMessagesCount} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reviews');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <span className="flex items-center gap-3">
              <Star className="h-4 w-4" /> Reviews & Feedback
            </span>
            {pendingReviewsCount > 0 ? (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[0.65rem] font-bold text-black">
                {pendingReviewsCount} pending
              </span>
            ) : (
              <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.65rem]">
                {testimonials.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings className="h-4 w-4" /> Settings & Account
            </span>
          </button>
        </nav>

        {/* Live Site & Logout Footer */}
        <div className="p-4 border-t border-border/80 space-y-2">
          <button
            type="button"
            onClick={onBackToSite}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium text-foreground bg-surface border border-border hover:border-accent/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-accent" /> View Live Portfolio
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout CMS
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-xs uppercase tracking-widest text-accent font-semibold">
                NIFTYGRAPHY Studio
              </p>
              <h2 className="text-sm font-bold text-foreground capitalize">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'projects' && 'Projects & Works Manager'}
                {activeTab === 'categories' && 'Portfolio Categories'}
                {activeTab === 'packages' && 'Design Packages & Pricing'}
                {activeTab === 'messages' && 'Client Inquiries'}
                {activeTab === 'reviews' && 'Reviews & Testimonials'}
                {activeTab === 'settings' && 'CMS & Owner Settings'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-sm hover:scale-102 transition-transform"
            >
              <Plus className="h-3.5 w-3.5" /> Add Project
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:border-accent/60 transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-accent" /> Live Preview
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface/80 to-accent/5 p-6 sm:p-8">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-semibold text-accent">
                    <Sparkles className="h-3.5 w-3.5" /> Owner Admin Active
                  </span>
                  <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Welcome back, {settings.ownerName?.split(' ')[0] || 'Shen'}!
                  </h1>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Manage your portfolio works, publish new graphics directly from your computer, and respond to incoming client project inquiries with zero hassle.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-md hover:scale-102 transition-transform"
                    >
                      <Plus className="h-4 w-4" /> Upload New Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-medium text-foreground hover:border-accent/60 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 text-accent" /> View Inquiries ({unreadMessagesCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div
                  onClick={() => setActiveTab('projects')}
                  className="cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-semibold">Total Projects</span>
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-3 text-3xl font-bold font-display text-foreground">{projects.length}</p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    {publishedCount} Published · {draftCount} Drafts
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('categories')}
                  className="cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-semibold">Categories</span>
                    <Layers className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-3 text-3xl font-bold font-display text-foreground">{categories.length}</p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">Branding, Thumbnails...</p>
                </div>

                <div
                  onClick={() => setActiveTab('messages')}
                  className="cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-semibold">Inquiries</span>
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-3 text-3xl font-bold font-display text-foreground">{messages.length}</p>
                  <p className="mt-1 text-[0.7rem] text-accent font-medium">
                    {unreadMessagesCount} unread submissions
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('reviews')}
                  className="cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-semibold">Client Reviews</span>
                    <Star className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-3 text-3xl font-bold font-display text-foreground">{testimonials.length}</p>
                  <p className="mt-1 text-[0.7rem] text-emerald-400 font-medium">
                    {testimonials.filter(t => t.status === 'approved' || !t.status).length} live on site
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('packages')}
                  className="cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-semibold">Packages</span>
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-3 text-3xl font-bold font-display text-foreground">{packages.length}</p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">Starter, Suite & Retainers</p>
                </div>
              </div>

              {/* Quick Management Preview */}
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                {/* Recent Projects */}
                <div className="rounded-2xl border border-border bg-surface p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Recent Portfolio Works</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="text-xs text-accent hover:underline"
                    >
                      View all ({projects.length})
                    </button>
                  </div>

                  <div className="mt-4 divide-y divide-border/60">
                    {projects.slice(0, 5).map((p) => (
                      <div key={p.id || p.slug} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.thumbnail || p.hero}
                            alt={p.title}
                            className="h-11 w-14 rounded-lg object-cover border border-border shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-foreground truncate">{p.title}</h4>
                            <p className="text-[0.68rem] text-muted-foreground">{p.category} · {p.year}</p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${
                            p.published !== false
                              ? 'bg-success/15 text-success'
                              : 'bg-yellow-500/15 text-yellow-300'
                          }`}
                        >
                          {p.published !== false ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Inquiries */}
                <div className="rounded-2xl border border-border bg-surface p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Recent Inquiries</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="text-xs text-accent hover:underline"
                    >
                      View all ({messages.length})
                    </button>
                  </div>

                  <div className="mt-4 divide-y divide-border/60">
                    {messages.length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">No inquiries received yet.</p>
                    ) : (
                      messages.slice(0, 4).map((m) => (
                        <div key={m.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-foreground">{m.name}</h4>
                            <span className="text-[0.65rem] text-muted-foreground">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[0.7rem] text-accent mt-0.5">{m.projectType} · {m.budget}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{m.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              categories={categories}
              onRefresh={loadData}
              onRefreshCategories={loadData}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManager
              categories={categories}
              projects={projects}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'packages' && (
            <PackagesManager
              packages={packages}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesManager
              messages={messages}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsManager
              testimonials={testimonials}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManager
              settings={settings}
              onRefresh={loadData}
            />
          )}
        </main>
      </div>

      {/* Quick Add Project Modal */}
      {quickAddOpen && (
        <ProjectEditorModal
          categories={categories}
          onClose={() => setQuickAddOpen(false)}
          onRefreshCategories={loadData}
          onSaved={() => {
            loadData();
            setActiveTab('projects');
          }}
        />
      )}
    </div>
  );
}
