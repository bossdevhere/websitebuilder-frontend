import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Heart } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface LandingFooterProps {
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenLogin, onOpenSignup }) => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`border-t py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isDark ? "border-slate-800 bg-slate-950 text-slate-400" : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand info */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className={`font-bold text-sm tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              AI Web Studio
            </span>
          </div>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="text-xs text-slate-500">Autonomous React App Architecture</span>
        </div>

        {/* Quick Anchor Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
          <a href="#features" className="hover:text-indigo-500 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-indigo-500 transition-colors">
            How It Works
          </a>
          <a href="#faq" className="hover:text-indigo-500 transition-colors">
            FAQ
          </a>
          {onOpenLogin ? (
            <button
              type="button"
              onClick={onOpenLogin}
              className="hover:text-indigo-500 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <Link to="/login" className="hover:text-indigo-500 transition-colors">
              Sign In
            </Link>
          )}
          {onOpenSignup ? (
            <button
              type="button"
              onClick={onOpenSignup}
              className="hover:text-indigo-500 transition-colors cursor-pointer"
            >
              Create Account
            </button>
          ) : (
            <Link to="/signup" className="hover:text-indigo-500 transition-colors">
              Create Account
            </Link>
          )}
        </div>

        {/* Status Pill & Copyright */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs text-slate-500 text-center">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Engine Online</span>
          </div>
          <span>© {new Date().getFullYear()} AI Web Studio.</span>
        </div>
      </div>
    </footer>
  );
};
