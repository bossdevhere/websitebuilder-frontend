import React from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center space-x-3 mb-8">
        <LayoutDashboard className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center space-x-2 text-indigo-400 mb-2">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-semibold text-white">Authentication Status</h3>
          </div>
          <p className="text-sm text-slate-400">Authenticated via Supabase Auth</p>
          <div className="mt-4 text-xs font-mono bg-slate-900 p-2.5 rounded border border-slate-800 text-indigo-300 truncate">
            {user?.email}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold text-white">Phase 1 Status</h3>
          </div>
          <p className="text-sm text-slate-400">Auth & Login Pipeline Operational</p>
          <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
            Ready for Review
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center space-x-2 text-purple-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-white">Next Up: Phase 2</h3>
          </div>
          <p className="text-sm text-slate-400">Project Management & Monaco Editor</p>
          <div className="mt-4 text-xs text-slate-400">
            Pending Phase 1 approval
          </div>
        </div>
      </div>
    </div>
  );
};
