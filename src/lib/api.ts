import { Category, InquiryMessage, PackageItem, Project } from '../types';

export const API_BASE = '/api';

export function getAdminToken(): string | null {
  return localStorage.getItem('niftygraphy_admin_token');
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem('niftygraphy_admin_token', token);
  } else {
    localStorage.removeItem('niftygraphy_admin_token');
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
export async function apiLogin(password: string, email?: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
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
export async function apiUploadFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Upload failed');
  }

  if (Array.isArray(data.urls)) {
    return data.urls;
  }
  if (data.url) {
    return [data.url];
  }
  return [];
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
  const res = await fetch(`${API_BASE}/categories`);
  const data = await res.json();
  return data.categories || [];
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
