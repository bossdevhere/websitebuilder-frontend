export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  conversation_id?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  project_id: string;
}

export interface AgentStreamEvent {
  event: string;
  data: {
    status?: string;
    filePath?: string;
    fileContent?: string;
    deletedPath?: string;
    [key: string]: any;
  };
}
