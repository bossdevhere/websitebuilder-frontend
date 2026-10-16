import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Zap, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface LandingCtaProps {
  onInstantDemo: () => void;
  isDemoLoading: boolean;
}

export const LandingCta: React.FC<LandingCtaProps> = ({ onInstantDemo, isDemoLoading }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div
        className={`relative rounded-3xl p-8 sm:p-12 md:p-16 text-center border overflow-hidden shadow-2xl ${
          isDark
            ? "border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80"
            : "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-indigo-500/10"
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Building Today</span>
          </div>

          <h2 className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Turn Your Ideas into Running React Apps Now
          </h2>

          <p className={`text-sm sm:text-base mb-8 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Test the live sandbox with instant guest access or register in seconds for unlimited permanent workspaces, collaboration, and complete code downloads.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
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
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={onInstantDemo}
                  disabled={isDemoLoading}
                  className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl font-semibold border transition-all active:scale-[0.98] cursor-pointer ${
                    isDark
                      ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10"
                      : "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 shadow-sm"
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{isDemoLoading ? "Starting Demo..." : "⚡ Try 1-Click Guest Demo"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
