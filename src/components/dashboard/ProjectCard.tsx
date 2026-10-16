import React from "react";
import { Trash2, Download, ArrowRight, Loader2 } from "lucide-react";
import { Project } from "../../types";
import { useTheme } from "../../context/ThemeContext";

const CARD_BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
];

function getProjectBannerImage(id: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const selectedIndex = Math.abs(hash + index) % CARD_BANNER_IMAGES.length;
  return CARD_BANNER_IMAGES[selectedIndex];
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isDemo: boolean;
  isDownloading: boolean;
  onOpen: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onDownload: (e: React.MouseEvent, project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isDemo,
  isDownloading,
  onOpen,
  onDelete,
  onDownload,
}) => {
  const { isDark } = useTheme();
  const bannerImg = getProjectBannerImage(project.id, index);

  return (
    <div
      onClick={() => onOpen(project.id)}
      className={`project-card group rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden border ${
        isDark
          ? "bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
          : "bg-white border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Card Banner Image */}
      <div className="h-32 w-full relative overflow-hidden bg-slate-950">
        <img
          src={bannerImg}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isDark
              ? "from-slate-950 via-slate-950/30 to-transparent"
              : "from-slate-900/80 via-slate-900/20 to-transparent"
          }`}
        />
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className="text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            React + Tailwind
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
          <button
            onClick={(e) => onDownload(e, project)}
            disabled={isDownloading}
            className="p-1.5 text-slate-300 hover:text-indigo-300 bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md rounded-lg transition-colors border border-slate-800"
            title={isDemo ? "Download Code (Sign up required)" : "Download Source Code (.ZIP)"}
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={(e) => onDelete(e, project.id)}
            className="p-1.5 text-slate-300 hover:text-red-400 bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md rounded-lg transition-colors border border-slate-800"
            title="Delete Workspace"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className={`font-bold text-base mb-1.5 transition-colors truncate ${
              isDark
                ? "text-white group-hover:text-indigo-300"
                : "text-slate-900 group-hover:text-indigo-600"
            }`}
          >
            {project.name}
          </h3>
          <p
            className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {project.description || "Interactive AI web application workspace."}
          </p>
        </div>

        <div
          className={`pt-3 border-t flex items-center justify-between text-[11px] ${
            isDark ? "border-slate-800/80 text-slate-500" : "border-slate-100 text-slate-500"
          }`}
        >
          <button
            onClick={(e) => onDownload(e, project)}
            disabled={isDownloading}
            className={`flex items-center space-x-1 transition-colors ${
              isDark
                ? "text-slate-400 hover:text-indigo-400"
                : "text-slate-600 hover:text-indigo-600"
            }`}
            title={isDemo ? "Sign in to download code" : "Download Project ZIP"}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Code</span>
          </button>
          <span
            className={`flex items-center space-x-1 font-medium group-hover:translate-x-1 transition-transform ${
              isDark ? "text-indigo-400" : "text-indigo-600"
            }`}
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
