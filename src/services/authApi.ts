import { apiFetch, fetchWithAuth, buildApiUrl } from "./client";
import { AuthResponse, AuthUser } from "../types";

export const authApi = {
  signup: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  demoLogin: async (): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/auth/demo", {
      method: "POST",
    });
  },

  cleanupDemo: async (token: string): Promise<void> => {
    try {
      await fetch(buildApiUrl("/projects/demo/cleanup"), {
        method: "POST",
        keepalive: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignored for graceful beacon exit
    }
  },

  logout: async (token?: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  me: async (token: string): Promise<{ user: AuthUser }> => {
    return fetchWithAuth<{ user: AuthUser }>("/auth/me", token);
  },
};
