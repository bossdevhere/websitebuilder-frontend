import React, { useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";

interface CreateProjectModalProps {
  isOpen: boolean;
  name: string;
  description: string;
  isCreating: boolean;
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  name,
  description,
  isCreating,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onClose,
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      gsap.fromTo(
        modalContentRef.current,
        { opacity: 0, scale: 0.92, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.5)" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div
        ref={modalContentRef}
        className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Workspace</h2>
            <p className="text-xs text-slate-400">Initialize a fresh React environment with live AI assistant.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Coffee Roastery"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description / Goal (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe what you want to build or features you'd like..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {isCreating ? "Initializing Workspace..." : "Create & Open Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
