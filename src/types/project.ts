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

export interface StarterTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  icon: any;
  defaultPrompt: string;
}
