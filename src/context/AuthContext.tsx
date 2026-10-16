import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

import { authApi, projectsApi } from "../services";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signup: (email: string, pass: string, name?: string) => Promise<{ error?: string }>;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  demoLogin: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isDemo = Boolean(
    (user as any)?.is_demo ||
    (user as any)?.user_metadata?.is_demo ||
    user?.email === "demo@aiwebstudio.dev" ||
    session?.access_token?.startsWith("demo-token-")
  );

  useEffect(() => {
    // 1. Check for active demo session in localStorage
    const savedDemo = localStorage.getItem("ai_builder_demo_session");
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        if (parsed?.access_token && parsed?.user) {
          setSession(parsed);
          setUser(parsed.user);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    // 2. Check initial Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 3. Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem("ai_builder_demo_session")) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cleanup demo project when demo user exits or closes tab
  useEffect(() => {
    const handleUnload = () => {
      if (isDemo && session?.access_token) {
        authApi.cleanupDemo(session.access_token);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [isDemo, session?.access_token]);

  const demoLogin = async () => {
    try {
      const data = await authApi.demoLogin();
      if (data.session && data.user) {
        setSession(data.session as any);
        setUser(data.user as any);
        localStorage.setItem("ai_builder_demo_session", JSON.stringify(data.session));
        return {};
      }
      return { error: "Failed to create demo session" };
    } catch (err: any) {
      return { error: err.message || "Failed to start demo session" };
    }
  };

  const signup = async (email: string, pass: string, name?: string) => {
    try {
      const currentDemoSession = localStorage.getItem("ai_builder_demo_session");
      let demoTokenToClaim: string | null = null;
      if (currentDemoSession) {
        try {
          const parsed = JSON.parse(currentDemoSession);
          if (parsed.access_token) {
            demoTokenToClaim = parsed.access_token;
          }
        } catch {}
      }

      const data = await authApi.signup(email, pass, name);

      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Claim pending demo project into the new registered account
      if (demoTokenToClaim && data.session?.access_token) {
        try {
          await projectsApi.claimDemoProject(data.session.access_token, demoTokenToClaim);
        } catch (claimErr) {
          console.warn("Could not transfer demo project on signup:", claimErr);
        }
      }

      localStorage.removeItem("ai_builder_demo_session");
      return {};
    } catch (err: any) {
      return { error: err.message || "Signup failed" };
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const currentDemoSession = localStorage.getItem("ai_builder_demo_session");
      let demoTokenToClaim: string | null = null;
      if (currentDemoSession) {
        try {
          const parsed = JSON.parse(currentDemoSession);
          if (parsed.access_token) {
            demoTokenToClaim = parsed.access_token;
          }
        } catch {}
      }

      const data = await authApi.login(email, pass);

      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Claim pending demo project into the logged-in account
      if (demoTokenToClaim && data.session?.access_token) {
        try {
          await projectsApi.claimDemoProject(data.session.access_token, demoTokenToClaim);
        } catch (claimErr) {
          console.warn("Could not transfer demo project on login:", claimErr);
        }
      }

      localStorage.removeItem("ai_builder_demo_session");
      return {};
    } catch (err: any) {
      return { error: err.message || "Login failed" };
    }
  };

  const logout = async () => {
    if (session?.access_token) {
      if (isDemo) {
        await authApi.cleanupDemo(session.access_token);
        localStorage.removeItem("ai_builder_demo_session");
      } else {
        await authApi.logout(session.access_token).catch(() => {});
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemo, signup, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
