import React from "react";
import { useNavigate } from "react-router-dom";
import { Download, Sparkles, X, ArrowRight, CheckCircle2 } from "lucide-react";

interface DownloadAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const DownloadAuthModal: React.FC<DownloadAuthModalProps> = ({
  isOpen,
  onClose,
  projectName = "your project",
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentPath = window.location.pathname + window.location.search;
  const redirectParam = encodeURIComponent(currentPath);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-indigo-500/20 to-transparent blur-xl pointer-events-none" />

        {/* Close Button - elevated z-index to guarantee clickability */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all z-30 cursor-pointer"
          aria-label="Close modal"
          title="Close"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        <div className="p-6 md:p-8 text-center relative z-10">
          {/* Header Icon */}
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
            <Download className="w-7 h-7 text-indigo-400" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sign Up or Log In to Download</span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Export Full Codebase</h2>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Downloading the complete, production-ready React codebase for{" "}
            <strong className="text-slate-200">{projectName}</strong> is available for registered accounts. Create a free account or log in to unlock source code downloads and permanently save your project!
          </p>

          {/* Benefits List */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-left space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full React + Vite + Tailwind ZIP codebase</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant local execution (<code className="text-indigo-300 font-mono">npm install && npm run dev</code>)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Auto-saves your demo project into your account</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/signup?redirect=${redirectParam}`);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Create Free Account to Download</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/login?redirect=${redirectParam}`);
              }}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Already have an account? Log In
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors pt-1 cursor-pointer"
            >
              Continue in Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
