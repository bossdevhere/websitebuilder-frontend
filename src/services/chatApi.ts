import { fetchWithAuth, apiFetch } from "./client";
import { Conversation, ChatMessage, LLMConfigInfo } from "../types";

export interface SendMessageResponse {
  message?: any;
  response?: string;
  deletedFiles?: string[];
  changes?: any[];
  fileChanges?: any[];
  [key: string]: any;
}

export const chatApi = {
  getConversations: async (token: string, projectId: string): Promise<Conversation[]> => {
    const res = await fetchWithAuth<{ conversations: Conversation[] }>(
      `/projects/${projectId}/conversations`,
      token
    );
    return res.conversations || [];
  },

  createConversation: async (token: string, projectId: string, title: string): Promise<Conversation> => {
    const res = await fetchWithAuth<{ conversation: Conversation }>(
      `/projects/${projectId}/conversations`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ title }),
      }
    );
    return res.conversation;
  },

  getMessages: async (token: string, projectId: string, conversationId: string): Promise<ChatMessage[]> => {
    try {
      const res = await fetchWithAuth<{ messages: ChatMessage[] }>(
        `/projects/${projectId}/conversations/${conversationId}/messages`,
        token
      );
      return res.messages || [];
    } catch (err: any) {
      // Fallback for older agent message endpoint if applicable
      try {
        const legacyRes = await fetchWithAuth<{ messages: ChatMessage[] }>(
          `/agent/projects/${projectId}/messages`,
          token
        );
        return legacyRes.messages || [];
      } catch {
        throw err;
      }
    }
  },

  sendMessage: async (
    token: string,
    projectId: string,
    conversationId: string | null,
    prompt: string
  ): Promise<SendMessageResponse> => {
    const endpoint = conversationId
      ? `/projects/${projectId}/conversations/${conversationId}/messages`
      : `/agent/projects/${projectId}/prompt`;

    return fetchWithAuth<SendMessageResponse>(endpoint, token, {
      method: "POST",
      body: JSON.stringify({ content: prompt, prompt }),
    });
  },

  getLlmConfig: async (): Promise<LLMConfigInfo> => {
    return apiFetch<LLMConfigInfo>("/llm/config");
  },
};
