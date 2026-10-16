import { fetchWithAuth } from "./client";
import { Project, ProjectFile } from "../types";
import { downloadProjectZip } from "./zipService";

export const projectsApi = {
  getProjects: async (token: string): Promise<Project[]> => {
    const res = await fetchWithAuth<{ projects: Project[] }>("/projects", token);
    return res.projects || [];
  },

  createProject: async (token: string, name: string, description?: string): Promise<Project> => {
    const res = await fetchWithAuth<{ project: Project }>("/projects", token, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    return res.project;
  },

  getProjectById: async (token: string, id: string): Promise<Project> => {
    const res = await fetchWithAuth<{ project: Project }>(`/projects/${id}`, token);
    return res.project;
  },

  deleteProject: async (token: string, id: string): Promise<void> => {
    await fetchWithAuth(`/projects/${id}`, token, {
      method: "DELETE",
    });
  },

  updateFile: async (token: string, projectId: string, path: string, content: string): Promise<ProjectFile> => {
    const res = await fetchWithAuth<{ file: ProjectFile }>(`/projects/${projectId}/files`, token, {
      method: "PUT",
      body: JSON.stringify({ path, content }),
    });
    return res.file;
  },

  deleteFile: async (token: string, projectId: string, path: string): Promise<void> => {
    await fetchWithAuth(`/projects/${projectId}/files`, token, {
      method: "DELETE",
      body: JSON.stringify({ path }),
    });
  },

  downloadProjectZip,
};
