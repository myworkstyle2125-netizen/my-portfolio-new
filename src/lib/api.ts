import { Category, InquiryMessage, PackageItem, Project, Testimonial } from '../types';
import { APPROVED_CATEGORY_ITEMS, APPROVED_PROJECT_CATEGORIES } from '../data/siteData';

export const API_BASE = '/api';

const memoryStore: Record<string, string> = {};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val) return val;
      }
    } catch {}
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const val = window.sessionStorage.getItem(key);
        if (val) return val;
      }
    } catch {}
    const cookieVal = getCookie(key);
    if (cookieVal) return cookieVal;
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {}
    try {
      setCookie(key, value);
    } catch {}
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch {}
    try {
      removeCookie(key);
    } catch {}
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
    ...(token ? { Authorization: `Bearer ${token}`, 'x-admin-token': token } : {}),
  };
}

/**
 * Safe JSON parser helper that guarantees we never throw
 * "Unexpected token '<', '<!doctype ...' is not valid JSON".
 */
export async function parseResponseJson<T = any>(res: Response, endpoint = 'API'): Promise<T> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (err: any) {
      throw new Error(`Invalid JSON received from ${endpoint}: ${err.message}`);
    }
  }

  const rawText = await res.text().catch(() => '');
  try {
    return JSON.parse(rawText);
  } catch {
    const preview = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
    throw new Error(
      `Server returned HTTP ${res.status} for ${endpoint}: ${preview || (res.ok ? 'OK' : 'Request error')}`
    );
  }
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
  const data = await parseResponseJson(res, 'Login');
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed');
  }
  setAdminToken(data.token);
  return data;
}

export async function apiCheckAuth() {
  const token = getAdminToken();

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
      credentials: 'same-origin',
    });
    if (!res.ok) {
      if (token) setAdminToken(null);
      return { authenticated: false };
    }
    const data = await parseResponseJson(res, 'Auth check');
    const isAuth = Boolean(data && data.authenticated);
    if (!isAuth && token) setAdminToken(null);
    return { authenticated: isAuth, user: data?.user };
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
  const data = await parseResponseJson(res, 'Change password');
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

export async function apiUploadSingle(file: File): Promise<string> {
  const token = getAdminToken();
  const authHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}`, 'x-admin-token': token } : {}),
  };

  // Attempt 1: Standard multipart FormData upload
  try {
    const formData = new FormData();
    formData.append('file', file, file.name || 'upload.jpg');
    formData.append('files', file, file.name || 'upload.jpg');

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    const data = await parseResponseJson(res, 'Multipart upload');
    if (res.ok && data.success && (data.url || data.urls?.[0])) {
      return data.url || data.urls[0];
    }
  } catch (err: any) {
    console.warn(`Multipart upload for "${file.name}" encountered issue, attempting base64 pipeline:`, err?.message || err);
  }

  // Attempt 2: Base64 JSON upload fallback (guarantees delivery across sandboxed iframes)
  try {
    const base64 = await fileToBase64(file);
    const res = await fetch(`${API_BASE}/upload/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        image: base64,
        filename: file.name || 'upload.jpg',
      }),
    });

    const data = await parseResponseJson(res, 'Base64 upload');
    if (res.ok && data.success && (data.url || data.urls?.[0])) {
      return data.url || data.urls[0];
    }
    throw new Error(data.message || `Server rejected upload for "${file.name}"`);
  } catch (err: any) {
    console.error(`Upload error for "${file.name}":`, err);
    throw new Error(err.message || `Failed to upload image "${file.name}". Please check the file format and try again.`);
  }
}

export async function apiUploadFiles(
  files: File[],
  onProgress?: (completed: number, total: number, lastUploadedUrl?: string) => void
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const validFiles = files.filter((f) => f && f.size > 0);
  if (validFiles.length === 0) return [];

  const successfulUrls: string[] = [];
  const errors: string[] = [];

  // Controlled concurrency ensures maximum stability without network or memory bottleneck
  // Reliably supports any number of images (single, batch of 10, 50, 100+)
  const CONCURRENCY = 2;
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < validFiles.length) {
      const index = currentIndex++;
      const file = validFiles[index];
      try {
        const url = await apiUploadSingle(file);
        if (url) {
          successfulUrls.push(url);
          onProgress?.(successfulUrls.length, validFiles.length, url);
        }
      } catch (err: any) {
        console.error(`Failed uploading file [${file.name}]:`, err);
        errors.push(`${file.name}: ${err.message || 'Upload error'}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, validFiles.length) }, () => worker());
  await Promise.all(workers);

  if (successfulUrls.length === 0 && errors.length > 0) {
    throw new Error(`Upload failed: ${errors[0]}`);
  }

  return successfulUrls;
}

// ----------------------------------------------------
// PROJECTS API
// ----------------------------------------------------
export async function apiGetProjects(publishedOnly = false): Promise<Project[]> {
  const query = publishedOnly ? '?published_only=true' : '';
  const res = await fetch(`${API_BASE}/projects${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await parseResponseJson(res, 'Get projects');
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch projects');
  }
  return data.projects;
}

export async function apiGetProject(idOrSlug: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${idOrSlug}`);
  const data = await parseResponseJson(res, `Get project ${idOrSlug}`);
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
  const data = await parseResponseJson(res, 'Create project');
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
  const data = await parseResponseJson(res, `Update project ${id}`);
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
  const data = await parseResponseJson(res, `Delete project ${id}`);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete project');
  }
}

export async function apiDuplicateProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await parseResponseJson(res, `Duplicate project ${id}`);
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
  const data = await parseResponseJson(res, `Toggle publish ${id}`);
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
  const data = await parseResponseJson(res, `Toggle featured ${id}`);
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
    const data = await parseResponseJson(res, 'Get categories');
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
  const data = await parseResponseJson(res, 'Create category');
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
  const data = await parseResponseJson(res, `Update category ${id}`);
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
  const data = await parseResponseJson(res, `Delete category ${id}`);
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
  const data = await parseResponseJson(res, 'Get messages');
  return data.messages || [];
}

export async function apiSaveMessage(msg: Partial<InquiryMessage>) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  });
  return parseResponseJson(res, 'Save message');
}

export async function apiMarkMessageRead(id: string) {
  const res = await fetch(`${API_BASE}/messages/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return parseResponseJson(res, 'Mark message read');
}

export async function apiDeleteMessage(id: string) {
  const res = await fetch(`${API_BASE}/messages/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return parseResponseJson(res, 'Delete message');
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
    const data = await parseResponseJson(res, 'Get testimonials');
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
    const data = await parseResponseJson(res, 'Submit testimonial');
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
  return parseResponseJson(res, 'Update testimonial status');
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
  return parseResponseJson(res, 'Delete testimonial');
}

// ----------------------------------------------------
// PACKAGES & SETTINGS API
// ----------------------------------------------------
export async function apiGetPackages(): Promise<PackageItem[]> {
  const res = await fetch(`${API_BASE}/packages`);
  const data = await parseResponseJson(res, 'Get packages');
  return data.packages || [];
}

export async function apiGetSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await parseResponseJson(res, 'Get settings');
  return data.settings || {};
}

export async function apiUpdateSettings(settings: any) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  return parseResponseJson(res, 'Update settings');
}
