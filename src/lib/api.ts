import { Category, InquiryMessage, PackageItem, Project, Testimonial } from '../types';
import { APPROVED_CATEGORY_ITEMS, APPROVED_PROJECT_CATEGORIES } from '../data/siteData';

export const API_BASE = '/api';

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (err) {
      console.warn(`LocalStorage read blocked for key "${key}", using memory fallback.`, err);
    }
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (err) {
      console.warn(`LocalStorage write blocked for key "${key}", using memory fallback.`, err);
    }
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (err) {
      console.warn(`LocalStorage delete blocked for key "${key}", using memory fallback.`, err);
    }
    delete memoryStore[key];
  },
};

export function getAdminToken(): string | null {
  return safeStorage.getItem('niftygraphy_admin_token');
}

export function setAdminToken(token: string | null) {
  if (token) {
    safeStorage.setItem('niftygraphy_admin_token', token);
  } else {
    safeStorage.removeItem('niftygraphy_admin_token');
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------
export async function apiLogin(password: string, usernameOrEmail?: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: usernameOrEmail,
      username: usernameOrEmail,
      identifier: usernameOrEmail,
      password,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed');
  }
  setAdminToken(data.token);
  return data;
}

export async function apiCheckAuth() {
  const token = getAdminToken();
  if (!token) return { authenticated: false };

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return { authenticated: res.ok && data.authenticated, user: data.user };
  } catch {
    return { authenticated: false };
  }
}

export async function apiLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } finally {
    setAdminToken(null);
  }
}

export async function apiChangePassword(currentPassword: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update password');
  }
  return data;
}

// ----------------------------------------------------
// FILE UPLOAD API
// ----------------------------------------------------
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function apiUploadFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const token = getAdminToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  // Attempt 1: Multipart FormData upload
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.urls) && data.urls.length > 0) return data.urls;
        if (data.url) return [data.url];
      }
    }
  } catch (err) {
    console.warn('Multipart upload stream error, falling back to base64 encoding:', err);
  }

  // Attempt 2: Base64 JSON upload (guarantees 100% compatibility in AI Studio preview iframes)
  try {
    const base64Images = await Promise.all(files.map((f) => fileToBase64(f)));
    const res = await fetch(`${API_BASE}/upload/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        images: base64Images,
        filename: files[0]?.name || 'design-upload.jpg',
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (Array.isArray(data.urls) && data.urls.length > 0) return data.urls;
      if (data.url) return [data.url];
    }
    throw new Error(data.message || 'Upload failed');
  } catch (err: any) {
    console.error('Upload error:', err);
    throw new Error(err.message || 'Image upload failed. Please try again.');
  }
}

export async function apiUploadSingle(file: File): Promise<string> {
  const urls = await apiUploadFiles([file]);
  if (!urls.length) throw new Error('No upload URL returned');
  return urls[0];
}

// ----------------------------------------------------
// PROJECTS API
// ----------------------------------------------------
export async function apiGetProjects(publishedOnly = false): Promise<Project[]> {
  const query = publishedOnly ? '?published_only=true' : '';
  const res = await fetch(`${API_BASE}/projects${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch projects');
  }
  return data.projects;
}

export async function apiGetProject(idOrSlug: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${idOrSlug}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Project not found');
  }
  return data.project;
}

export async function apiCreateProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(project),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create project');
  }
  return data.project;
}

export async function apiUpdateProject(id: string, project: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(project),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update project');
  }
  return data.project;
}

export async function apiDeleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete project');
  }
}

export async function apiDuplicateProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to duplicate project');
  }
  return data.project;
}

export async function apiTogglePublish(id: string, published: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/projects/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ published }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update status');
  }
  return data.published;
}

export async function apiToggleFeatured(id: string, featured: boolean): Promise<boolean> {
  const res = await fetch(`${API_BASE}/projects/${id}/featured`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ featured }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update featured flag');
  }
  return data.featured;
}

// ----------------------------------------------------
// CATEGORIES API
// ----------------------------------------------------
export async function apiGetCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    const fetched: Category[] = data.categories || [];
    const valid = fetched.filter((c: Category) =>
      (APPROVED_PROJECT_CATEGORIES as readonly string[]).includes(c.name)
    );
    return valid.length === 6 ? valid : (APPROVED_CATEGORY_ITEMS as Category[]);
  } catch {
    return APPROVED_CATEGORY_ITEMS as Category[];
  }
}

export async function apiCreateCategory(name: string, description?: string): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create category');
  }
  return data.category;
}

export async function apiUpdateCategory(id: string, category: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update category');
  }
  return data.category;
}

export async function apiDeleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete category');
  }
}

// ----------------------------------------------------
// MESSAGES API
// ----------------------------------------------------
export async function apiGetMessages(): Promise<InquiryMessage[]> {
  const res = await fetch(`${API_BASE}/messages`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.messages || [];
}

export async function apiSaveMessage(msg: Partial<InquiryMessage>) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  });
  return res.json();
}

export async function apiMarkMessageRead(id: string) {
  const res = await fetch(`${API_BASE}/messages/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function apiDeleteMessage(id: string) {
  const res = await fetch(`${API_BASE}/messages/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ----------------------------------------------------
// TESTIMONIALS & REVIEWS API
// ----------------------------------------------------
const LOCAL_TESTIMONIALS_KEY = 'niftygraphy_local_reviews';

export function getLocalTestimonials(): Testimonial[] {
  try {
    const raw = safeStorage.getItem(LOCAL_TESTIMONIALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalTestimonial(testimonial: Testimonial) {
  try {
    const current = getLocalTestimonials();
    const updated = [testimonial, ...current.filter((t) => t.id !== testimonial.id)];
    safeStorage.setItem(LOCAL_TESTIMONIALS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving local testimonial:', err);
  }
}

export async function apiGetTestimonials(all = false): Promise<Testimonial[]> {
  try {
    const query = all ? '?all=true' : '';
    const res = await fetch(`${API_BASE}/testimonials${query}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.testimonials)) {
      return data.testimonials;
    }
  } catch (err) {
    console.warn('API error fetching testimonials, falling back to local/default:', err);
  }

  // Fallback to local storage
  return getLocalTestimonials();
}

export async function apiSubmitTestimonial(payload: Partial<Testimonial>): Promise<Testimonial> {
  // Save locally first for instant display
  const localId = `testi-${Date.now()}`;
  const cleanName = (payload.name || 'Client').trim();
  const parts = cleanName.split(' ').filter(Boolean);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  const fallbackItem: Testimonial = {
    id: localId,
    name: cleanName,
    role: (payload.role || 'Client').trim(),
    initials,
    quote: (payload.quote || '').trim(),
    rating: payload.rating || 5,
    status: 'approved',
    createdAt: new Date().toISOString(),
  };

  saveLocalTestimonial(fallbackItem);

  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success && data.testimonial) {
      saveLocalTestimonial(data.testimonial);
      return data.testimonial;
    }
  } catch (err) {
    console.warn('API error saving review, local storage kept:', err);
  }

  return fallbackItem;
}

export async function apiUpdateTestimonialStatus(id: string, status: 'approved' | 'pending' | 'rejected') {
  const res = await fetch(`${API_BASE}/testimonials/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function apiDeleteTestimonial(id: string) {
  const res = await fetch(`${API_BASE}/testimonials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  // Also remove from local storage
  try {
    const current = getLocalTestimonials();
    safeStorage.setItem(LOCAL_TESTIMONIALS_KEY, JSON.stringify(current.filter((t) => t.id !== id)));
  } catch {}
  return res.json();
}

// ----------------------------------------------------
// PACKAGES & SETTINGS API
// ----------------------------------------------------
export async function apiGetPackages(): Promise<PackageItem[]> {
  const res = await fetch(`${API_BASE}/packages`);
  const data = await res.json();
  return data.packages || [];
}

export async function apiGetSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await res.json();
  return data.settings || {};
}

export async function apiUpdateSettings(settings: any) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  return res.json();
}
