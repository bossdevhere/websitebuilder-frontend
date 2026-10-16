/**
 * Centralized API HTTP Client & Base URL Resolution
 * Automatically resolves backend URLs across local dev, preview environments,
 * and production deployments (Render backend + Vercel frontend).
 */

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string || "").trim();
  if (!envUrl) {
    return "/api";
  }
  const trimmed = envUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  let cleanPath = path.trim();
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }
  // Prevent duplicate /api/api
  if (base.endsWith("/api") && cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.slice(4);
  }
  return `${base}${cleanPath}`;
}

export async function safeParseResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text || text.trim() === "") {
    if (!response.ok) {
      if (response.status === 405) {
        throw new Error(
          `Request failed with status 405 (Method Not Allowed). The request went to Vercel instead of your Render backend. Please set VITE_API_BASE_URL in Vercel Project Settings to your Render URL and redeploy.`
        );
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
    return {} as T;
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (_err) {
    // Non-JSON response received (e.g. 404/405 from Vercel or 502/503 from sleeping Render server)
    if (response.status === 404 || response.status === 405) {
      throw new Error(
        `Backend API route not reached (HTTP ${response.status}). The request went to Vercel instead of your Render backend. Please ensure VITE_API_BASE_URL is set in Vercel to your Render backend URL and redeployed.`
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    return await safeParseResponse<T>(response);
  } catch (err: any) {
    if (err.name === "TypeError" && err.message?.includes("Failed to fetch")) {
      throw new Error(
        "Network connection failed. Please check your internet connection or verify the backend service is running."
      );
    }
    throw err;
  }
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
