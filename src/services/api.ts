const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ProjectFile {
  id?: string;
  project_id?: string;
  path: string;
  content: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  files?: ProjectFile[];
}

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "API Request failed");
  }
  return data;
}

export const projectsApi = {
  getProjects: async (token: string): Promise<Project[]> => {
    const res = await fetchWithAuth("/projects", token);
    return res.projects;
  },

  createProject: async (token: string, name: string, description?: string): Promise<Project> => {
    const res = await fetchWithAuth("/projects", token, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    return res.project;
  },

  getProjectById: async (token: string, id: string): Promise<Project> => {
    const res = await fetchWithAuth(`/projects/${id}`, token);
    return res.project;
  },

  deleteProject: async (token: string, id: string): Promise<void> => {
    await fetchWithAuth(`/projects/${id}`, token, {
      method: "DELETE",
    });
  },

  updateFile: async (token: string, projectId: string, path: string, content: string): Promise<ProjectFile> => {
    const res = await fetchWithAuth(`/projects/${projectId}/files`, token, {
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
};
