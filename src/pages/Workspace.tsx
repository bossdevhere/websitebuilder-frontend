import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi, chatApi, buildApiUrl } from "../services";
import { Project, LLMConfigInfo, ViewMode, ThemeMode } from "../types";
import { FileExplorer } from "../components/workspace/FileExplorer";
import { CodeEditor } from "../components/workspace/CodeEditor";
import { ChatPanel } from "../components/workspace/ChatPanel";
import { PreviewPanel } from "../components/workspace/PreviewPanel";
import { ArrowLeft, Loader2, Play, Cpu, Code, Eye, Columns, Sun, Moon, Download } from "lucide-react";
import { DownloadAuthModal } from "../components/common";

export const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session, isDemo } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfigInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("app_theme") as ThemeMode) || "dark";
  });

  const isLight = theme === "light";

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
  };

  const fetchProjectData = async () => {
    if (!id || !session?.access_token) return;
    try {
      const proj = await projectsApi.getProjectById(session.access_token, id);
      
      // Auto-seed fresh starter template for empty projects
      if (!proj.files || proj.files.length === 0 || !proj.files.some((f) => f.path.endsWith("App.tsx"))) {
        const safeTitle = proj.name || "New Project";
        const starterFiles = [
          {
            path: "App.tsx",
            content: `import React, { useState } from 'react';
import { Sparkles, Code2, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">${safeTitle}</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          Ready for AI Development
        </span>
      </header>

      {/* Hero Welcome Canvas */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="inline-flex p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-2">
            <Rocket className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Welcome to <span className="text-indigo-400">${safeTitle}</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Your new project workspace is ready. Tell the AI assistant what you want to build, or edit this code directly to get started.
            </p>
          </div>

          {/* Interactive React State Widget */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-md mx-auto shadow-xl space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Code2 className="w-4 h-4 text-indigo-400" /> Interactive React State
              </span>
              <span className="text-xs text-indigo-400 font-mono">Count: {count}</span>
            </div>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Click to test reactivity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Ideas */}
          <div className="pt-4 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl">
              <p className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Full App Generation
              </p>
              <p className="text-[11px] text-slate-400">Ask the AI: "Build a modern dashboard with charts and dark mode"</p>
            </div>
            <div className="p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl">
              <p className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Component Library
              </p>
              <p className="text-[11px] text-slate-400">Ask the AI: "Add an e-commerce catalog with search and cart drawer"</p>
            </div>
            <div className="p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl">
              <p className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Custom Landing Page
              </p>
              <p className="text-[11px] text-slate-400">Ask the AI: "Create a SaaS landing page with pricing and testimonials"</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        AI Web Builder • Powered by Autonomous LLM Agent
      </footer>
    </div>
  );
}`
          },
          {
            path: "index.html",
            content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>${safeTitle}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`
          }
        ];

        proj.files = starterFiles;
        starterFiles.forEach((f) => {
          projectsApi.updateFile(session.access_token, id, f.path, f.content).catch(() => {});
        });
      }

      setProject(proj);
      if (proj.files && proj.files.length > 0 && !activeFilePath) {
        const appFile = proj.files.find((f) => f.path.endsWith("App.tsx")) || proj.files[0];
        setActiveFilePath(appFile.path);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset state when navigating to another project to avoid cross-project stale code bleed
    setProject(null);
    setActiveFilePath(null);
    setLoading(true);
    setError(null);

    fetchProjectData();

    // Fetch active LLM config
    chatApi
      .getLlmConfig()
      .then((data) => setLlmConfig(data))
      .catch((err) => console.error("Failed to fetch LLM config:", err));
  }, [id, session?.access_token]);

  const activeFile = project?.files?.find((f) => f.path === activeFilePath) || null;

  const handleSelectFile = (path: string) => {
    setActiveFilePath(path);
  };

  const handleCreateFile = async (path: string) => {
    if (!project || !session?.access_token) return;
    try {
      const newFile = await projectsApi.updateFile(session.access_token, project.id, path, "");
      setProject((prev) => {
        if (!prev) return prev;
        const existing = prev.files || [];
        return {
          ...prev,
          files: [...existing.filter((f) => f.path !== path), newFile],
        };
      });
      setActiveFilePath(path);
    } catch (err: any) {
      alert("Failed to create file: " + err.message);
    }
  };

  const handleDeleteFile = async (path: string) => {
    if (!project || !session?.access_token) return;
    try {
      await projectsApi.deleteFile(session.access_token, project.id, path);
      setProject((prev) => {
        if (!prev) return prev;
        const remaining = (prev.files || []).filter((f) => f.path !== path);
        return { ...prev, files: remaining };
      });
      if (activeFilePath === path) {
        const remaining = (project.files || []).filter((f) => f.path !== path);
        setActiveFilePath(remaining.length > 0 ? remaining[0].path : null);
      }
    } catch (err: any) {
      alert("Failed to delete file: " + err.message);
    }
  };

  const handleSaveFileContent = async (content: string) => {
    if (!project || !activeFilePath || !session?.access_token) return;
    const updatedFile = await projectsApi.updateFile(
      session.access_token,
      project.id,
      activeFilePath,
      content
    );
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        files: (prev.files || []).map((f) => (f.path === activeFilePath ? updatedFile : f)),
      };
    });
  };

  const handleAgentFileUpdated = (path: string, content: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const existing = prev.files || [];
      const updatedFiles = existing.some((f) => f.path === path)
        ? existing.map((f) => (f.path === path ? { ...f, content } : f))
        : [...existing, { path, content }];
      return { ...prev, files: updatedFiles };
    });
    setActiveFilePath(path);
  };

  const handleAgentFileDeleted = (path: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const remaining = (prev.files || []).filter((f) => f.path !== path);
      return { ...prev, files: remaining };
    });
    if (activeFilePath === path) {
      setActiveFilePath(null);
    }
  };

  const handleDownloadCode = async () => {
    if (isDemo) {
      setIsDownloadModalOpen(true);
      return;
    }
    if (!project) return;
    setIsDownloading(true);
    try {
      await projectsApi.downloadProjectZip(project);
    } catch (err: any) {
      alert("Failed to download project code: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[80vh] space-x-2 ${isLight ? "text-slate-600 bg-slate-50" : "text-slate-400 bg-slate-950"}`}>
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={`max-w-md mx-auto my-12 p-6 border rounded-xl text-center space-y-4 ${isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"}`}>
        <p className="text-red-400">{error || "Project not found"}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-65px)] transition-colors ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-100"}`}>
      {/* Workspace Header Bar */}
      <div className={`h-12 border-b px-4 flex items-center justify-between transition-colors ${isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/")}
            className={`p-1 rounded transition-colors ${isLight ? "hover:bg-slate-200 text-slate-600 hover:text-slate-900" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`font-bold text-base truncate ${isLight ? "text-slate-900" : "text-white"}`}>{project.name}</h1>

          {isDemo && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
              <span>⚡ Demo Mode</span>
            </span>
          )}

          {/* Active LLM Provider Badge */}
          {llmConfig && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded flex items-center space-x-1.5 border ${
                isLight
                  ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                  : "text-indigo-300 bg-indigo-950/80 border-indigo-800/80"
              }`}
              title="Provider-Agnostic LLM Engine"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono uppercase font-semibold text-[10px]">{llmConfig.provider}:</span>
              <span>{llmConfig.modelName}</span>
            </span>
          )}
        </div>

        {/* View Mode & Theme Toggle Controls */}
        <div className="flex items-center space-x-3">
          {/* Light / Dark Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
            }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* View Mode Selector */}
          <div className={`flex items-center border rounded-lg p-0.5 ${isLight ? "bg-slate-100 border-slate-300" : "bg-slate-900 border-slate-800"}`}>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "code"
                  ? "bg-indigo-600 text-white"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Code View (Explorer + Code Editor)"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "split"
                  ? "bg-indigo-600 text-white"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Split View (Explorer + Editor + Live Preview)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-indigo-600 text-white"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Preview Mode (Live Preview Only, Explorer Hidden)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={handleDownloadCode}
            disabled={isDownloading}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white"
            }`}
            title={isDemo ? "Sign up to download code" : "Download Project Code (.ZIP)"}
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Download Code</span>
          </button>

          <button
            onClick={() => setViewMode("preview")}
            className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-medium transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Preview</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: AI Chat Panel */}
        <ChatPanel
          projectId={project.id}
          token={session?.access_token || ""}
          onFileUpdated={handleAgentFileUpdated}
          onFileDeleted={handleAgentFileDeleted}
          onProcessingStateChange={setIsAgentProcessing}
          theme={theme}
        />

        {/* Middle: File Explorer Sidebar (Hidden when in Preview mode; visible in Code & Split modes) */}
        {(viewMode === "code" || viewMode === "split") && (
          <FileExplorer
            files={project.files || []}
            activeFilePath={activeFilePath}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            theme={theme}
          />
        )}

        {/* Right Pane(s): Monaco Code Editor & Interactive PreviewPanel */}
        {(viewMode === "code" || viewMode === "split") && (
          <div className={viewMode === "split" ? "w-1/2 flex flex-col" : "flex-1 flex flex-col"}>
            <CodeEditor
              filePath={activeFilePath}
              content={activeFile ? activeFile.content : ""}
              onSave={handleSaveFileContent}
              theme={theme}
            />
          </div>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div className={viewMode === "split" ? "w-1/2 flex flex-col" : "flex-1 flex flex-col"}>
            <PreviewPanel
              files={project.files || []}
              activeFilePath={activeFilePath}
              previewUrl={buildApiUrl(`/runtime/projects/${project.id}/preview`)}
              isProcessing={isAgentProcessing}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* Code Download Gating Modal for Demo Guest */}
      <DownloadAuthModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        projectName={project.name}
      />
    </div>
  );
};
