import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi } from "../services";
import { Project, StarterTemplate } from "../types";
import {
  Plus,
  FolderCode,
  Loader2,
  Sparkles,
  Search,
  LayoutDashboard,
  Cpu,
  Layers,
  ShoppingBag,
  BarChart3,
  Briefcase,
  Smartphone,
  Code2,
} from "lucide-react";
import gsap from "gsap";
import { DownloadAuthModal, DemoLimitModal } from "../components/common";
import {
  StarterTemplateCard,
  ProjectCard,
  DemoBanner,
  CreateProjectModal,
} from "../components/dashboard";

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "ecommerce",
    title: "E-Commerce Storefront",
    description: "Modern product catalog with filter sidebar, cart drawer, and responsive checkout layout.",
    category: "E-Commerce",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80",
    icon: ShoppingBag,
    defaultPrompt: "Build a sleek e-commerce store with product grid, search, shopping cart drawer, and dark mode.",
  },
  {
    id: "saas",
    title: "SaaS Analytics Dashboard",
    description: "Multi-panel analytics portal with KPI stats cards, performance charts, and notification drawer.",
    category: "Dashboard",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    icon: BarChart3,
    defaultPrompt: "Create a SaaS analytics dashboard with revenue charts, user metrics, sidebar navigation, and quick filter pills.",
  },
  {
    id: "portfolio",
    title: "Developer Portfolio",
    description: "Clean personal portfolio showcasing projects, interactive skill badges, and contact modal.",
    category: "Portfolio",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    icon: Briefcase,
    defaultPrompt: "Design a personal developer portfolio showcasing featured web projects, interactive tech stack tags, and contact form.",
  },
  {
    id: "landing",
    title: "Startup SaaS Landing Page",
    description: "Conversion-optimized landing page featuring hero section, feature grid, pricing tier cards, and FAQ.",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
    icon: Smartphone,
    defaultPrompt: "Build a modern high-converting SaaS landing page with bold hero, interactive feature tabs, pricing table, and testimonials.",
  },
];

export const Dashboard: React.FC = () => {
  const { user, session, isDemo } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [demoLimitNotice, setDemoLimitNotice] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);

  const fetchProjects = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const data = await projectsApi.getProjects(session.access_token);
      setProjects(data);
    } catch (err: any) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session?.access_token]);

  // GSAP animation on projects loaded
  useEffect(() => {
    if (!loading && projects.length > 0) {
      gsap.fromTo(
        ".project-card",
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" }
      );
    }
  }, [loading, projects.length]);

  const handleOpenCreateModal = () => {
    if (isDemo && projects.length >= 1) {
      setDemoLimitNotice(
        "Demo accounts are limited to 1 active project at a time. Delete your current workspace to create a new one, or sign up for free to build unlimited permanent projects!"
      );
      return;
    }
    setName("");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !session?.access_token) return;

    setIsCreating(true);
    try {
      const newProj = await projectsApi.createProject(session.access_token, name.trim(), description.trim());
      setIsModalOpen(false);
      setName("");
      setDescription("");
      navigate(`/workspace/${newProj.id}`);
    } catch (err: any) {
      alert("Failed to create project: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTemplate = (template: StarterTemplate) => {
    if (isDemo && projects.length >= 1) {
      setDemoLimitNotice(
        "Demo accounts are limited to 1 active project at a time. Delete your current workspace to launch a new template, or sign up for free to unlock unlimited workspaces!"
      );
      return;
    }
    setName(template.title);
    setDescription(template.description);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!session?.access_token) return;
    if (confirm("Are you sure you want to delete this project workspace?")) {
      try {
        await projectsApi.deleteProject(session.access_token, id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert("Failed to delete project: " + err.message);
      }
    }
  };

  const handleDownloadProject = async (e: React.MouseEvent, proj: Project) => {
    e.stopPropagation();
    if (isDemo) {
      setSelectedProjectName(proj.name);
      setIsDownloadModalOpen(true);
      return;
    }
    if (!session?.access_token) return;

    setDownloadingId(proj.id);
    try {
      const fullProject = await projectsApi.getProjectById(session.access_token, proj.id);
      await projectsApi.downloadProjectZip(fullProject);
    } catch (err: any) {
      alert("Failed to download project code: " + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const userDisplayName =
    (user as any)?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Developer";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Hero Welcome Banner */}
      <div
        ref={heroRef}
        className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 px-6 py-12 overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Autonomous Agent Studio</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{userDisplayName}</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
                Create, customize, and preview complete React applications with conversational AI agents.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-xl shadow-indigo-600/25 active:scale-[0.98] self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center space-x-3 backdrop-blur-md">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
                <FolderCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Your Workspaces</p>
                <p className="text-xl font-bold text-white">{projects.length} {projects.length === 1 ? "Project" : "Projects"}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center space-x-3 backdrop-blur-md">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Code Engine</p>
                <p className="text-xl font-bold text-white">Gemini 2.5 Flash</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center space-x-3 backdrop-blur-md">
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Live Sandbox</p>
                <p className="text-xl font-bold text-white">Babel Standalone</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-12">
        {/* Demo Mode Banner */}
        {isDemo && <DemoBanner />}

        {/* Template Starters Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Start with a Recommended Blueprint</span>
              </h2>
              <p className="text-xs text-slate-400">Launch a new AI application from curated industry blueprints.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STARTER_TEMPLATES.map((tmpl) => (
              <StarterTemplateCard key={tmpl.id} template={tmpl} onSelect={handleSelectTemplate} />
            ))}
          </div>
        </div>

        {/* User Projects Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <FolderCode className="w-5 h-5 text-indigo-400" />
                <span>Your Active Workspaces</span>
              </h2>
              <p className="text-xs text-slate-400">
                {projects.length} {projects.length === 1 ? "project" : "projects"} generated
              </p>
            </div>

            {/* Search Input */}
            {projects.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-sm">Loading your workspaces...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
              <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                <Code2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No projects created yet</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Start by creating your first project workspace. You can describe your web app idea to the AI agent to generate full code in seconds.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create First Workspace</span>
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm">No projects matched your search "{searchQuery}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={idx}
                  isDemo={isDemo}
                  isDownloading={downloadingId === project.id}
                  onOpen={(id) => navigate(`/workspace/${id}`)}
                  onDelete={handleDeleteProject}
                  onDownload={handleDownloadProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        name={name}
        description={description}
        isCreating={isCreating}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onSubmit={handleCreateProject}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Demo Limit Notice Modal */}
      <DemoLimitModal
        isOpen={Boolean(demoLimitNotice)}
        message={demoLimitNotice}
        onClose={() => setDemoLimitNotice(null)}
      />

      {/* Code Download Gating Modal for Demo Guest */}
      <DownloadAuthModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        projectName={selectedProjectName}
      />
    </div>
  );
};
