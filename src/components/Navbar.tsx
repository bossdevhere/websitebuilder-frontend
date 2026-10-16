import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "./common/ThemeToggle";
import { Sparkles, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isWorkspace = location.pathname.startsWith("/workspace");

  // If in workspace, Workspace page has its own top toolbar
  if (isWorkspace) {
    return null;
  }

  const userDisplayName =
    (user as any)?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Developer";

  const isLandingPage = location.pathname === "/";

  return (
    <nav
      className={`border-b backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between transition-colors duration-200 ${
        isDark
          ? "border-slate-800/80 bg-slate-950/80 text-white"
          : "border-slate-200 bg-white/80 text-slate-900 shadow-sm"
      }`}
    >
      {/* Brand Logo & Left Nav */}
      <div className="flex items-center space-x-6">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-extrabold text-base tracking-tight leading-none group-hover:text-indigo-500 transition-colors ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              AI Web Studio
            </span>
            <span
              className={`text-[10px] font-mono tracking-wider leading-none mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Autonomous React Builder
            </span>
          </div>
        </Link>

        {/* Landing Page Anchor Links (Desktop) */}
        {isLandingPage && (
          <div className="hidden md:flex items-center space-x-4 text-xs font-medium">
            <a
              href="#features"
              className={`transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className={`transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              How It Works
            </a>
            <a
              href="#faq"
              className={`transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              FAQ
            </a>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Global Theme Toggle */}
        <ThemeToggle />

        {user ? (
          <>
            <Link
              to="/dashboard"
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                location.pathname === "/dashboard"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <div
              className={`hidden sm:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                isDark
                  ? "text-slate-300 bg-slate-900/80 border-slate-800"
                  : "text-slate-700 bg-slate-100 border-slate-200"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {userDisplayName.charAt(0)}
              </div>
              <span className="font-medium truncate max-w-[120px] md:max-w-none">
                {user.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className={`flex items-center space-x-1 text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200"
              }`}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors ${
                isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 sm:px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/25"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
