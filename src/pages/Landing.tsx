import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export const Landing: React.FC = () => {
  const { demoLogin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

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
      <LandingHero onInstantDemo={handleInstantDemo} isDemoLoading={isDemoLoading} />

      {/* Interactive Mock Preview Sandbox */}
      <LandingPreviewDemo />

      {/* Core Features */}
      <LandingFeatures />

      {/* 3-Step Workflow ("How It Works") */}
      <LandingWorkflow />

      {/* Frequently Asked Questions */}
      <LandingFaq />

      {/* Bottom CTA Block */}
      <LandingCta onInstantDemo={handleInstantDemo} isDemoLoading={isDemoLoading} />

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
};

export default Landing;
