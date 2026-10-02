import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Code2, LogOut, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-indigo-400 hover:text-indigo-300">
        <Code2 className="w-6 h-6 text-indigo-500" />
        <span>AI Website Builder</span>
      </Link>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
