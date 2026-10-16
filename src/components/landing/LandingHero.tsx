import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Zap, Play, LayoutDashboard, ShieldCheck, Cpu, Code2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import gsap from "gsap";

interface LandingHeroProps {
  onInstantDemo: () => void;
  isDemoLoading: boolean;
  onOpenSignup: () => void;
  onOpenLogin: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onInstantDemo,
  isDemoLoading,
  onOpenSignup,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's motion preference for performance on low-end hardware
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-anim-item",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
      );

      gsap.to(".hero-float-badge", {
        y: -5,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className={`relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200 border-b ${
        isDark
          ? "border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 text-slate-100"
          : "border-slate-200 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 text-slate-900"
      }`}
    >
      {/* Lightweight ambient glow orbs - GPU accelerated with transform */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[400px] rounded-full blur-3xl pointer-events-none opacity-40 will-change-transform ${
          isDark ? "bg-indigo-600/20" : "bg-indigo-400/20"
        }`}
      />
      <div
        className={`absolute top-1/3 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30 will-change-transform ${
          isDark ? "bg-purple-600/20" : "bg-purple-300/30"
        }`}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Eyebrow Badge */}
        <div className="hero-anim-item inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm border transition-colors">
          <div className="p-1 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
            <Sparkles className="w-3 h-3" />
          </div>
          <span
            className={
              isDark
                ? "bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-medium"
                : "text-indigo-800 font-medium"
            }
          >
            Next-Gen Autonomous Agent Studio • Powered by Gemini 2.5
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-anim-item text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-6">
          <span>Build, Preview & Export</span>
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {" "}Full React Apps in Seconds
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`hero-anim-item max-w-2xl mx-auto text-sm sm:text-base md:text-lg mb-8 leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          Chat with an intelligent autonomous AI architect that creates multi-file component structures,
          executes live Babel sandboxes, and exports clean, production-ready code you can run locally.
        </p>

        {/* Primary Action Buttons */}
        <div className="hero-anim-item flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto mb-10">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Your Workspaces</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenSignup}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Start Building for Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onInstantDemo}
                disabled={isDemoLoading}
                className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl font-semibold border transition-all active:scale-[0.98] cursor-pointer ${
                  isDark
                    ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 shadow-md shadow-amber-500/10"
                    : "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 shadow-sm"
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{isDemoLoading ? "Starting Demo..." : "⚡ Try 1-Click Guest Demo"}</span>
              </button>
            </>
          )}

          <a
            href="#features"
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl font-medium border transition-colors cursor-pointer ${
              isDark
                ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
                : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 shadow-sm"
            }`}
          >
            <Play className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
            <span>Explore Features</span>
          </a>
        </div>

        {/* Floating Quick Value Badges */}
        <div className="hero-anim-item flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
          <div
            className={`hero-float-badge px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 shadow-sm ${
              isDark
                ? "bg-slate-900/80 border-slate-800 text-slate-300"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Full React 18 Components</span>
          </div>

          <div
            className={`hero-float-badge px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 shadow-sm ${
              isDark
                ? "bg-slate-900/80 border-slate-800 text-slate-300"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-500" />
            <span>Gemini 2.5 Flash Engine</span>
          </div>

          <div
            className={`hero-float-badge px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 shadow-sm ${
              isDark
                ? "bg-slate-900/80 border-slate-800 text-slate-300"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>In-Browser Sandboxing</span>
          </div>
        </div>
      </div>
    </section>
  );
};
