import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi, Project } from "../services/api";
import { FileExplorer } from "../components/workspace/FileExplorer";
import { CodeEditor } from "../components/workspace/CodeEditor";
import { ChatPanel } from "../components/workspace/ChatPanel";
import { PreviewPanel } from "../components/workspace/PreviewPanel";
import { ArrowLeft, Loader2, Play, Cpu, Code, Eye, Columns } from "lucide-react";

interface LLMConfigInfo {
  provider: string;
  modelName: string;
}

type ViewMode = "code" | "preview" | "split";

export const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfigInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  const fetchProjectData = async () => {
    if (!id || !session?.access_token) return;
    try {
      const proj = await projectsApi.getProjectById(session.access_token, id);
      setProject(proj);
      if (proj.files && proj.files.length > 0 && !activeFilePath) {
        setActiveFilePath(proj.files[0].path);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();

    // Fetch active LLM config
    fetch("/api/llm/config")
      .then((res) => res.json())
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] text-slate-400 space-x-2">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-4">
        <p className="text-red-400">{error || "Project not found"}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* Workspace Header Bar */}
      <div className="h-12 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/")}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-white text-base truncate">{project.name}</h1>

          {/* Active LLM Provider Badge */}
          {llmConfig && (
            <span
              className="text-xs text-indigo-300 bg-indigo-950/80 border border-indigo-800/80 px-2.5 py-0.5 rounded flex items-center space-x-1.5"
              title="Provider-Agnostic LLM Engine"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono uppercase font-semibold text-[10px]">{llmConfig.provider}:</span>
              <span>{llmConfig.modelName}</span>
            </span>
          )}
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "code"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Code Editor Only"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "split"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Split View (Editor + Live Preview)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Live Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={() => setViewMode("preview")}
            className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-medium transition-colors"
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
        />

        {/* Middle: File Explorer Sidebar */}
        <FileExplorer
          files={project.files || []}
          activeFilePath={activeFilePath}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
        />

        {/* Right Pane(s): Monaco Code Editor & Interactive PreviewPanel */}
        {(viewMode === "code" || viewMode === "split") && (
          <div className={viewMode === "split" ? "w-1/2 flex flex-col" : "flex-1 flex flex-col"}>
            <CodeEditor
              filePath={activeFilePath}
              content={activeFile ? activeFile.content : ""}
              onSave={handleSaveFileContent}
            />
          </div>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div className={viewMode === "split" ? "w-1/2 flex flex-col" : "flex-1 flex flex-col"}>
            <PreviewPanel files={project.files || []} activeFilePath={activeFilePath} />
          </div>
        )}
      </div>
    </div>
  );
};
