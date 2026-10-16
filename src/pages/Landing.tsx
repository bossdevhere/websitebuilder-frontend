import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LandingHero,
  LandingPreviewDemo,
  LandingFeatures,
  LandingWorkflow,
  LandingFaq,
  LandingCta,
  LandingFooter,
} from "../components/landing";
import { AuthModal, AuthMode } from "../components/auth";

interface LandingProps {
  initialAuthMode?: AuthMode;
}

export const Landing: React.FC<LandingProps> = ({ initialAuthMode }) => {
  const { demoLogin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(Boolean(initialAuthMode));
  const [authMode, setAuthMode] = useState<AuthMode>(initialAuthMode || "login");

  // Check URL query parameters (?auth=login or ?auth=signup) or prop changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authParam = searchParams.get("auth");

    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
      setAuthModalOpen(true);
    } else if (authParam === "login" || authParam === "signup") {
      setAuthMode(authParam);
      setAuthModalOpen(true);
    } else if (location.pathname === "/") {
      setAuthModalOpen(false);
    }
  }, [initialAuthMode, location.pathname, location.search]);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    // If user opened via /login or /signup, return smoothly to /
    if (location.pathname === "/login" || location.pathname === "/signup") {
      navigate("/", { replace: true });
    }
  };

  const handleInstantDemo = async () => {
    setDemoError(null);
    setIsDemoLoading(true);
    try {
      const res = await demoLogin();
      if (res.error) {
        setDemoError(res.error);
        alert("Failed to start demo session: " + res.error);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setDemoError(err.message || "Failed to start demo");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {demoError && (
        <div className="bg-red-600/90 text-white text-xs py-2 px-4 text-center font-medium sticky top-0 z-50">
          {demoError}
        </div>
      )}

      {/* Hero Section */}
      <LandingHero
        onInstantDemo={handleInstantDemo}
        isDemoLoading={isDemoLoading}
        onOpenSignup={() => openAuth("signup")}
        onOpenLogin={() => openAuth("login")}
      />

      {/* Interactive Mock Preview Sandbox */}
      <LandingPreviewDemo />

      {/* Core Features */}
      <LandingFeatures />

      {/* 3-Step Workflow ("How It Works") */}
      <LandingWorkflow />

      {/* Frequently Asked Questions */}
      <LandingFaq />

      {/* Bottom CTA Block */}
      <LandingCta
        onInstantDemo={handleInstantDemo}
        isDemoLoading={isDemoLoading}
        onOpenSignup={() => openAuth("signup")}
      />

      {/* Landing Footer */}
      <LandingFooter
        onOpenLogin={() => openAuth("login")}
        onOpenSignup={() => openAuth("signup")}
      />

      {/* Integrated Auth Modal (Login / Signup) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={closeAuthModal}
      />
    </div>
  );
};

export default Landing;
