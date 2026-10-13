import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Cpu, Zap, Star } from "lucide-react";
import gsap from "gsap";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
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
      navigate("/");
    }
  };

  const handleFillDemo = () => {
    setEmail("developer@example.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 lg:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden z-10">
        {/* Left Side: Form Section */}
        <div ref={formContainerRef} className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Brand Logo & Header */}
            <div className="auth-fade-in flex items-center space-x-2.5 mb-8">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">AI Web Studio</span>
            </div>

            <div className="auth-fade-in mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-sm text-slate-400">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="auth-fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
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
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="auth-fade-in pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  <span>{isSubmitting ? "Authenticating..." : "Sign In to Workspace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Demo Autofill Helper */}
              <div className="auth-fade-in pt-1">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full py-2 px-3 border border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-400 hover:text-slate-200 text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Autofill Sample Demo Account</span>
                </button>
              </div>
            </form>
          </div>

          <div className="auth-fade-in mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
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

          {/* Center Showcase Card */}
          <div className="my-auto z-10 space-y-4">
            <div className="p-6 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-200 font-medium italic mb-4 leading-relaxed">
                "We built and tested 4 production-grade React apps within an hour using AI Website Builder. The live preview and conversation memory are top notch."
              </p>
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Elena Vance"
                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/50"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Elena Vance</h4>
                  <p className="text-[11px] text-slate-400">Lead Frontend Engineer</p>
                </div>
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
