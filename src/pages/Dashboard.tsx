import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi, Project } from "../services/api";
import { Plus, FolderCode, Trash2, ArrowRight, Loader2, Sparkles } from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!session?.access_token) return;
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsApi.deleteProject(session.access_token, id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert("Failed to delete project: " + err.message);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Your Projects</h1>
          <p className="text-slate-400 text-sm">
            Manage your AI-generated applications & workspaces
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto my-8">
          <FolderCode className="w-12 h-12 text-slate-600 mx-auto mb-4 stroke-[1.5]" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Create your first project workspace to start building web apps with AI.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/workspace/${project.id}`)}
              className="group bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400 group-hover:text-indigo-300">
                    <FolderCode className="w-6 h-6" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                <span className="flex items-center space-x-1 text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Kanban Board"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your project idea..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
