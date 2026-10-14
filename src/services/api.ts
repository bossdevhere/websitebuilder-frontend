/**
 * Centralized API Service & Base URL Resolution
 * Automatically resolves the backend API URL across local development,
 * preview environments, and production deployments on Render / Vercel.
 */

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string || "").trim();
  if (!envUrl) {
    return "/api";
  }
  // Strip trailing slashes
  const trimmed = envUrl.replace(/\/+$/, "");
  // Ensure /api suffix is present
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  let cleanPath = path.trim();
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }
  // If base already ends with /api and cleanPath starts with /api/, avoid duplicate /api/api
  if (base.endsWith("/api") && cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.slice(4);
  }
  return `${base}${cleanPath}`;
}

export async function safeParseResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text || text.trim() === "") {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return {} as T;
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (_err) {
    // Non-JSON response received (e.g. 404 HTML from Vercel or 502/503 from sleeping Render server)
    if (response.status === 404) {
      throw new Error(
        `Backend API route not found (HTTP 404). Please ensure the backend is deployed on Render and VITE_API_BASE_URL is configured in your Vercel project environment variables.`
      );
    }
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new Error(
        `Backend service is waking up or temporarily unavailable (HTTP ${response.status}). If using Render Free tier, please wait ~30-50 seconds and retry.`
      );
    }
    throw new Error(
      `Received non-JSON response from server (HTTP ${response.status}): ${text.slice(0, 100)}`
    );
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(endpoint);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return safeParseResponse<T>(response);
}

export async function fetchWithAuth<T = any>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };
  return apiFetch<T>(endpoint, { ...options, headers });
}

export interface ProjectFile {
  id?: string;
  project_id?: string;
  path: string;
  content: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  files?: ProjectFile[];
}

export const authApi = {
  signup: async (email: string, password: string, name?: string) => {
    return apiFetch<{ message: string; user: any; session: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email: string, password: string) => {
    return apiFetch<{ message: string; user: any; session: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (token?: string) => {
    return apiFetch<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  me: async (token: string) => {
    return fetchWithAuth<{ user: any }>("/auth/me", token);
  },
};

export const projectsApi = {
  getProjects: async (token: string): Promise<Project[]> => {
    const res = await fetchWithAuth<{ projects: Project[] }>("/projects", token);
    return res.projects || [];
  },

  createProject: async (token: string, name: string, description?: string): Promise<Project> => {
    const res = await fetchWithAuth<{ project: Project }>("/projects", token, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    return res.project;
  },

  getProjectById: async (token: string, id: string): Promise<Project> => {
    const res = await fetchWithAuth<{ project: Project }>(`/projects/${id}`, token);
    return res.project;
  },

  deleteProject: async (token: string, id: string): Promise<void> => {
    await fetchWithAuth(`/projects/${id}`, token, {
      method: "DELETE",
    });
  },

  updateFile: async (token: string, projectId: string, path: string, content: string): Promise<ProjectFile> => {
    const res = await fetchWithAuth<{ file: ProjectFile }>(`/projects/${projectId}/files`, token, {
      method: "PUT",
      body: JSON.stringify({ path, content }),
    });
    return res.file;
  },

  deleteFile: async (token: string, projectId: string, path: string): Promise<void> => {
    await fetchWithAuth(`/projects/${projectId}/files`, token, {
      method: "DELETE",
      body: JSON.stringify({ path }),
    });
  },
};

