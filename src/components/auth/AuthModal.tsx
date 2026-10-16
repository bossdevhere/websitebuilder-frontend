import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, X, Zap, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import gsap from "gsap";

export type AuthMode = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "login",
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const { login, signup, demoLogin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  // Entrance animation
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.94, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" }
      );
    }
  }, [isOpen, mode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getRedirectPath = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("redirect") || "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let res;
    if (mode === "login") {
      res = await login(email, password);
    } else {
      res = await signup(email, password, name);
    }

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(getRedirectPath());
      }
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
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-all z-30 cursor-pointer ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          }`}
          aria-label="Close auth dialog"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-600/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className={`font-black text-base tracking-tight leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
              AI Web Studio
            </span>
            <p className="text-[11px] text-slate-400">Autonomous React Architect</p>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div
          className={`grid grid-cols-2 p-1 rounded-xl border mb-6 ${
            isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center space-x-2 animate-shake">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label
                className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
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
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${
                    isDark
                      ? "bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${
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
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${
                  isDark
                    ? "bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
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
                placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
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

          {mode === "signup" && (
            <div className="pt-1 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Free Tier Included</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant Code Export</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? "Authenticating..."
                  : mode === "login"
                  ? "Sign In to Workspace"
                  : "Create Account & Get Started"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Instant 1-Click Guest Demo Button */}
          <div className="pt-1">
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
              <span>{isDemoLoading ? "Starting Demo Session..." : "⚡ Try 1-Click Guest Demo (No signup)"}</span>
            </button>
          </div>
        </form>

        {/* Switch tab footer link */}
        <div className={`mt-6 pt-4 border-t text-center text-xs ${isDark ? "border-slate-800/80 text-slate-400" : "border-slate-100 text-slate-600"}`}>
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-indigo-500 hover:text-indigo-600 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-indigo-500 hover:text-indigo-600 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
