import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, Rocket, Code2, Globe } from "lucide-react";
import gsap from "gsap";

export const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".signup-fade-in",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }
      );

      gsap.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }
      );

      gsap.to(".floating-badge-1", {
        y: -6,
        duration: 2.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".floating-badge-2", {
        y: 6,
        duration: 2.7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.4,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await signup(email, password, name);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 lg:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background ambient gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden z-10">
        {/* Left Side: Form Section */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Brand Logo & Header */}
            <div className="signup-fade-in flex items-center space-x-2.5 mb-8">
              <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">AI Web Studio</span>
            </div>

            <div className="signup-fade-in mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Create Your Account</h1>
              <p className="text-sm text-slate-400">
                Start generating complete React applications with autonomous AI agents.
              </p>
            </div>

            {error && (
              <div className="signup-fade-in mb-5 p-3.5 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center space-x-2">
                <span className="font-semibold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="signup-fade-in">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="signup-fade-in">
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
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="signup-fade-in">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              {/* Feature Highlights Pills */}
              <div className="signup-fade-in pt-1 pb-1 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free AI Tier Included</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Live Preview</span>
                </div>
              </div>

              <div className="signup-fade-in pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  <span>{isSubmitting ? "Creating Workspace..." : "Sign Up & Get Started"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="signup-fade-in mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Visual Showcase Banner with Images & Floating Badges */}
        <div
          ref={heroRef}
          className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-10 overflow-hidden bg-cover bg-center border-l border-slate-800/80"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.95)), url("https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80")`,
          }}
        >
          {/* Top Floating Badge */}
          <div className="flex justify-between items-start z-10">
            <div className="floating-badge-1 bg-slate-900/80 backdrop-blur-md border border-purple-500/30 px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-xs text-purple-300 shadow-xl">
              <Rocket className="w-3.5 h-3.5 text-purple-400" />
              <span>Zero-Config Deployment</span>
            </div>
            <div className="floating-badge-2 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-xs text-indigo-300 shadow-xl">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full React Component Tree</span>
            </div>
          </div>

          {/* Center Showcase Card */}
          <div className="my-auto z-10 space-y-4">
            <div className="p-6 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Next-Gen Development</span>
              </div>
              <p className="text-sm text-slate-200 font-medium mb-4 leading-relaxed">
                Describe anything from landing pages to full interactive web apps. The agent architects modular code, executes safe refactors, and compiles client-side in real-time.
              </p>
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Marcus Brody"
                  className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/50"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Marcus Brody</h4>
                  <p className="text-[11px] text-slate-400">Founder & Full-Stack Architect</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Highlights */}
          <div className="z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>⚡ Babel Standalone</span>
            <span>✨ Gemini 2.5 LLM Factory</span>
            <span>🛡️ Sandbox Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
