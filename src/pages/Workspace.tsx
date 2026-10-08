import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi, Project } from "../services/api";
import { FileExplorer } from "../components/workspace/FileExplorer";
import { CodeEditor } from "../components/workspace/CodeEditor";
import { ChatPanel } from "../components/workspace/ChatPanel";
import { PreviewPanel } from "../components/workspace/PreviewPanel";
import { ArrowLeft, Loader2, Play, Cpu, Code, Eye, Columns, Sun, Moon } from "lucide-react";

interface LLMConfigInfo {
  provider: string;
  modelName: string;
}

type ViewMode = "code" | "preview" | "split";
type ThemeMode = "dark" | "light";

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
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
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
      
      // Auto-seed starter landing page components for empty projects
      if (!proj.files || proj.files.length === 0 || !proj.files.some((f) => f.path.endsWith("App.tsx"))) {
        const starterFiles = [
          {
            path: "components/Navbar.tsx",
            content: `import React, { useState } from 'react';\nimport { Sparkles, Menu, X } from 'lucide-react';\n\nexport const Navbar = () => {\n  const [isOpen, setIsOpen] = useState(false);\n  return (\n    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">\n      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">\n        <div className="flex items-center space-x-2">\n          <div className="p-2 bg-indigo-600 rounded-xl text-white">\n            <Sparkles className="w-5 h-5" />\n          </div>\n          <span className="font-bold text-xl text-white tracking-tight">ApexVision</span>\n        </div>\n        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">\n          <a href="#hero" className="hover:text-indigo-400 transition-colors">Home</a>\n          <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>\n          <a href="#services" className="hover:text-indigo-400 transition-colors">Services</a>\n          <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>\n        </nav>\n        <div className="hidden md:flex items-center space-x-4">\n          <button className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/30">Get Started</button>\n        </div>\n      </div>\n    </header>\n  );\n};`
          },
          {
            path: "components/Hero.tsx",
            content: `import React from 'react';\nimport { ArrowRight, Zap } from 'lucide-react';\n\nexport const Hero = () => {\n  return (\n    <section id="hero" className="relative py-24 px-6 overflow-hidden bg-slate-950 text-center">\n      <div className="max-w-4xl mx-auto">\n        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">\n          Build Intelligence into Every <span className="text-indigo-400">Web Experience</span>\n        </h1>\n        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">\n          Supercharge your digital workflow with autonomous AI agent architectures.\n        </p>\n        <button className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-600/30">\n          Explore Application\n        </button>\n      </div>\n    </section>\n  );\n};`
          },
          {
            path: "components/About.tsx",
            content: `import React from 'react';\nimport { CheckCircle } from 'lucide-react';\n\nexport const About = () => {\n  return (\n    <section id="about" className="py-20 px-6 bg-slate-900 border-t border-slate-800">\n      <div className="max-w-5xl mx-auto text-center">\n        <h2 className="text-3xl font-bold text-white mb-4">About Our Platform</h2>\n        <p className="text-slate-400 max-w-2xl mx-auto">We build state-of-the-art web generation engines that bridge creative vision and production code.</p>\n      </div>\n    </section>\n  );\n};`
          },
          {
            path: "components/Services.tsx",
            content: `import React from 'react';\nimport { Cpu, Code2, Globe } from 'lucide-react';\n\nexport const Services = () => {\n  return (\n    <section id="services" className="py-20 px-6 bg-slate-950 border-t border-slate-800">\n      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">\n        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">\n          <Cpu className="w-8 h-8 text-indigo-400 mx-auto mb-4" />\n          <h3 className="text-xl font-bold text-white mb-2">AI Agent Engine</h3>\n          <p className="text-slate-400 text-sm">Autonomous planning and code refactoring.</p>\n        </div>\n        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">\n          <Code2 className="w-8 h-8 text-indigo-400 mx-auto mb-4" />\n          <h3 className="text-xl font-bold text-white mb-2">Modular Architecture</h3>\n          <p className="text-slate-400 text-sm">Clean React component structure.</p>\n        </div>\n        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">\n          <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-4" />\n          <h3 className="text-xl font-bold text-white mb-2">Live Preview Engine</h3>\n          <p className="text-slate-400 text-sm">Instant client-side JSX transpilation.</p>\n        </div>\n      </div>\n    </section>\n  );\n};`
          },
          {
            path: "components/CTA.tsx",
            content: `import React from 'react';\nimport { Mail } from 'lucide-react';\n\nexport const CTA = () => {\n  return (\n    <section id="contact" className="py-20 px-6 bg-slate-900 border-t border-slate-800 text-center">\n      <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Your Project?</h2>\n      <p className="text-slate-300 max-w-md mx-auto mb-6">Describe your ideas to your AI developer agent to generate full applications.</p>\n    </section>\n  );\n};`
          },
          {
            path: "components/Footer.tsx",
            content: `import React from 'react';\n\nexport const Footer = () => {\n  return (\n    <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-xs text-slate-500">\n      © {new Date().getFullYear()} AI Web App Builder. All rights reserved.\n    </footer>\n  );\n};`
          },
          {
            path: "App.tsx",
            content: `import React from 'react';\nimport { Navbar } from './components/Navbar';\nimport { Hero } from './components/Hero';\nimport { About } from './components/About';\nimport { Services } from './components/Services';\nimport { CTA } from './components/CTA';\nimport { Footer } from './components/Footer';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">\n      <Navbar />\n      <Hero />\n      <About />\n      <Services />\n      <CTA />\n      <Footer />\n    </div>\n  );\n}`
          },
          {
            path: "index.html",
            content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Web Application</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`
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
              previewUrl={`/api/runtime/projects/${project.id}/preview`}
              isProcessing={isAgentProcessing}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
};
