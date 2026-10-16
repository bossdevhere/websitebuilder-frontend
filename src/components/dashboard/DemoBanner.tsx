import React from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export const DemoBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md border ${
        isDark
          ? "bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-indigo-500/10 border-amber-500/30 text-white"
          : "bg-gradient-to-r from-amber-50/90 via-white to-indigo-50/90 border-amber-300 text-slate-900 shadow-amber-500/5"
      }`}
    >
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl mt-0.5 sm:mt-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
              Guest Demo Workspace Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-500 border border-amber-500/30">
              1 Active Project Limit
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                isDark
                  ? "bg-slate-800 text-slate-300 border-slate-700"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              Auto-clears on exit
            </span>
          </div>
          <p
            className={`text-xs mt-1.5 leading-relaxed max-w-2xl ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            You are exploring as a guest. Demo projects are temporary and will be cleared when you close the tab. Create a free registered account to save unlimited workspaces, collaborate, and download complete source code!
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end shrink-0">
        <button
          onClick={() => navigate("/signup")}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
        >
          Sign Up for Free Account
        </button>
      </div>
    </div>
  );
};
