import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Cpu, Zap, Code2, Layers } from "lucide-react";
import gsap from "gsap";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const formContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animation for form and hero elements
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".auth-fade-in",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }
      );

      gsap.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }
      );

      // Gentle floating animation for floating badges
      gsap.to(".floating-badge-1", {
        y: -6,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".floating-badge-2", {
        y: 6,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
    }
  };

  const handleInstantDemoLogin = async () => {
    setError(null);
    setIsDemoLoading(true);

    const res = await demoLogin();
    setIsDemoLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-65px)] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden transition-colors duration-200 ${
        isDark ? "bg-slate-950" : "bg-slate-100/90"
      }`}
    >
      {/* Background ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden z-10 transition-colors duration-200 ${
          isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white/95"
        }`}
      >
        {/* Left Side: Form Section */}
        <div ref={formContainerRef} className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Brand Logo & Header */}
            <div className="auth-fade-in flex items-center space-x-2.5 mb-8">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className={`font-extrabold text-xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                AI Web Studio
              </span>
            </div>

            <div className="auth-fade-in mb-6">
              <h1 className={`text-2xl lg:text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                Welcome Back
              </h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Sign in to continue building and managing your AI-powered web applications.
              </p>
            </div>

            {error && (
              <div className="auth-fade-in mb-5 p-3.5 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center space-x-2">
                <span className="font-semibold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="auth-fade-in">
                <label
                  className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${
                      isDark
                        ? "bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500"
                    }`}
                  />
                </div>
              </div>

              <div className="auth-fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${
                      isDark
                        ? "bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-3 transition-colors cursor-pointer ${
                      isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="auth-fade-in pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  <span>{isSubmitting ? "Authenticating..." : "Sign In to Workspace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* One-Click Instant Demo Login */}
              <div className="auth-fade-in pt-1">
                <button
                  type="button"
                  disabled={isSubmitting || isDemoLoading}
                  onClick={handleInstantDemoLogin}
                  className={`w-full py-2.5 px-3 border text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                    isDark
                      ? "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 shadow-amber-500/10"
                      : "border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 shadow-amber-500/5"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{isDemoLoading ? "Starting Demo Session..." : "⚡ Explore Demo Workspace (1-Click)"}</span>
                </button>
              </div>
            </form>
          </div>

          <div
            className={`auth-fade-in mt-8 pt-6 border-t text-center ${
              isDark ? "border-slate-800/80 text-slate-400" : "border-slate-200 text-slate-600"
            }`}
          >
            <p className="text-xs">
              Don't have an account yet?{" "}
              <Link
                to={
                  new URLSearchParams(window.location.search).get("redirect")
                    ? `/signup?redirect=${encodeURIComponent(
                        new URLSearchParams(window.location.search).get("redirect")!
                      )}`
                    : "/signup"
                }
                className="text-indigo-500 hover:text-indigo-600 font-semibold underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Visual Showcase Banner with Images & Floating Badges */}
        <div
          ref={heroRef}
          className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-10 overflow-hidden bg-cover bg-center border-l border-slate-800/80"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.95)), url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80")`,
          }}
        >
          {/* Top Floating Badge */}
          <div className="flex justify-between items-start z-10">
            <div className="floating-badge-1 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-xs text-indigo-300 shadow-xl">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Agent LangGraph Engine</span>
            </div>
            <div className="floating-badge-2 bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-xs text-emerald-300 shadow-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sandboxed Preview</span>
            </div>
          </div>

          {/* Center Showcase Window Card */}
          <div className="my-auto z-10 space-y-4">
            <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden group">
              {/* macOS Window Title Bar */}
              <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-slate-400 font-mono ml-2">Workspace • App.tsx & Live Preview</span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  ● Live Sync
                </span>
              </div>

              {/* High-Res Visual App Preview Banner */}
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                  alt="AI Web Studio Interface"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/80 text-[11px] text-white">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI: "Generate modern analytics dashboard"</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
                    Compiled in 320ms
                  </span>
                </div>
              </div>

              {/* Feature Tags Footer */}
              <div className="p-4 bg-slate-900/50 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 text-slate-300">
                  <span className="px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/60 font-mono text-[10px]">React 18</span>
                  <span className="px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/60 font-mono text-[10px]">Tailwind CSS</span>
                  <span className="px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/60 font-mono text-[10px]">Monaco Editor</span>
                </div>
                <span className="text-emerald-400 font-medium">Instant Hot Reload</span>
              </div>
            </div>
          </div>

          {/* Bottom Highlights */}
          <div className="z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>⚡ React 18 & Tailwind</span>
            <span>✨ Gemini 2.5 AI Code Generation</span>
            <span>🔒 Isolated Workspaces</span>
          </div>
        </div>
      </div>
    </div>
  );
};
