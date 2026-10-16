import React from "react";
import { AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

interface DemoLimitModalProps {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
}

export const DemoLimitModal: React.FC<DemoLimitModalProps> = ({ isOpen, message, onClose }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  if (!isOpen || !message) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden border ${
          isDark
            ? "bg-slate-950 border-amber-500/30 text-white"
            : "bg-white border-amber-400/70 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-all z-30 cursor-pointer ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-900"
              : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          }`}
          aria-label="Close modal"
          title="Close"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Demo Limit Reached
            </h3>
            <p className="text-xs text-amber-500 font-medium">1 Active Project in Guest Mode</p>
          </div>
        </div>

        <p
          className={`text-xs sm:text-sm leading-relaxed mb-6 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-2 text-xs transition-colors text-center cursor-pointer ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/signup");
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-center cursor-pointer"
          >
            Sign Up for Free (Unlimited)
          </button>
        </div>
      </div>
    </div>
  );
};
