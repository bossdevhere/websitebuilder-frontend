import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, LogOut, User as UserIcon, Plus } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
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

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2.5 group">
        <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base text-white tracking-tight leading-none group-hover:text-indigo-300 transition-colors">
            AI Web Studio
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider leading-none mt-1">
            Autonomous React Builder
          </span>
        </div>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {userDisplayName.charAt(0)}
              </div>
              <span className="font-medium text-slate-200">{user.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/25"
            >
              Get Started Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
