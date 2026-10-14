import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Terminal, Plus, MessageSquare, AlertTriangle } from "lucide-react";
import { buildApiUrl, safeParseResponse } from "../../services/api";

interface Conversation {
  id: string;
  project_id: string;
  title: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string;
}

const sortMessagesChronologically = (list: Message[]): Message[] => {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    if (a.role === "user" && b.role === "assistant") return -1;
    if (a.role === "assistant" && b.role === "user") return 1;
    return 0;
  });
};

interface ChatPanelProps {
  projectId: string;
  token: string;
  onFileUpdated?: (path: string, content: string) => void;
  onFileDeleted?: (path: string) => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
  theme?: "dark" | "light";
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  projectId,
  token,
  onFileUpdated,
  onFileDeleted,
  onProcessingStateChange,
  theme = "dark",
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [uiError, setUiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLight = theme === "light";

  const updateProcessingState = (processing: boolean) => {
    setIsProcessing(processing);
    onProcessingStateChange?.(processing);
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus, agentLogs]);

  // Auto-resize textarea according to content, minimum height 64px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 64), 128)}px`;
    }
  }, [inputPrompt]);

  // Load persistent conversations for the project
  const fetchConversations = async () => {
    if (!projectId || !token) return;
    try {
      const res = await fetch(buildApiUrl(`/projects/${projectId}/conversations`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeParseResponse(res);
      if (data.conversations && data.conversations.length > 0) {
        setConversations(data.conversations);
        if (!activeConversationId) {
          setActiveConversationId(data.conversations[0].id);
        }
      }
    } catch (err: any) {
      console.warn("Conversations API fallback:", err.message);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [projectId, token]);

  // Load messages whenever activeConversationId changes
  const fetchMessages = async (convId: string) => {
    if (!projectId || !token || !convId) return;
    try {
      const res = await fetch(buildApiUrl(`/projects/${projectId}/conversations/${convId}/messages`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeParseResponse(res);
      if (data.messages && data.messages.length > 0) {
        setMessages(sortMessagesChronologically(data.messages));
        return;
      }
    } catch (err: any) {
      console.warn("Message fetch fallback:", err.message);
      try {
        const legacyRes = await fetch(buildApiUrl(`/agent/projects/${projectId}/messages`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await safeParseResponse(legacyRes);
        if (d.messages && d.messages.length > 0) {
          setMessages(sortMessagesChronologically(d.messages));
          return;
        }
      } catch (e) {}
    }

    // LocalStorage fallback if server has no messages
    try {
      const local = localStorage.getItem(`chat_messages_${projectId}_${convId}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(sortMessagesChronologically(parsed));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else if (projectId && token) {
      fetchMessages(projectId);
    }
  }, [activeConversationId, projectId, token]);

  // Persist messages in localStorage per conversation thread
  useEffect(() => {
    if (messages.length > 0 && projectId) {
      try {
        const key = `chat_messages_${projectId}_${activeConversationId || projectId}`;
        localStorage.setItem(key, JSON.stringify(sortMessagesChronologically(messages)));
      } catch (e) {}
    }
  }, [messages, projectId, activeConversationId]);

  // Connect Server-Sent Events (SSE) Stream
  useEffect(() => {
    if (!projectId || !token) return;

    const sseUrl = buildApiUrl(`/agent/projects/${projectId}/stream?token=${encodeURIComponent(token)}`);
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE Message]", data);
      } catch (e) {}
    };

    eventSource.addEventListener("status", (event: any) => {
      const data = JSON.parse(event.data);
      if (data.status === "planning" || data.status === "generating" || data.status === "verifying") {
        setAgentStatus(data.message || `AI Agent ${data.status}...`);
      }
      if (data.logs) setAgentLogs(data.logs);

      if (data.status === "done") {
        updateProcessingState(false);
        setAgentStatus(null);

        // Apply file updates if present in SSE payload
        if (Array.isArray(data.fileChanges) && onFileUpdated) {
          data.fileChanges.forEach((change: any) => {
            if (change.path && change.content) onFileUpdated(change.path, change.content);
          });
        }
        if (Array.isArray(data.deletedFiles) && onFileDeleted) {
          data.deletedFiles.forEach((delPath: string) => {
            if (delPath) onFileDeleted(delPath);
          });
        }

        // Immediately append assistant response to messages feed if present
        if (data.message && typeof data.message === "string") {
          const replyText = data.message;
          setMessages((prev) => {
            const alreadyHasReply = prev.some(
              (m) => m.role === "assistant" && (m.content === replyText || m.content.includes(replyText.slice(0, 40)))
            );
            if (alreadyHasReply) return prev;
            return sortMessagesChronologically([
              ...prev,
              {
                id: `asst-sse-${Date.now()}`,
                role: "assistant",
                content: replyText,
                created_at: new Date().toISOString(),
              },
            ]);
          });
        }
      } else if (data.status === "error") {
        updateProcessingState(false);
        setAgentStatus(null);
        if (data.message) {
          setUiError(data.message);
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: "assistant",
              content: data.message,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    });

    eventSource.addEventListener("file_updated", (event: any) => {
      const data = JSON.parse(event.data);
      if (onFileUpdated && data.path && data.content) {
        onFileUpdated(data.path, data.content);
      }
    });

    eventSource.addEventListener("file_deleted", (event: any) => {
      const data = JSON.parse(event.data);
      if (onFileDeleted && data.path) {
        onFileDeleted(data.path);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [projectId, token, activeConversationId, onFileUpdated, onFileDeleted]);

  const handleCreateNewChat = async () => {
    if (!projectId || !token) return;
    setUiError(null);
    try {
      const res = await fetch(buildApiUrl(`/projects/${projectId}/conversations`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: `Chat ${conversations.length + 1}` }),
      });
      const data = await safeParseResponse(res);
      if (data.conversation) {
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);
        setMessages([]);
      }
    } catch (err: any) {
      setUiError(err.message || "Conversation could not be created.");
    }
  };

  const handleSubmitPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isProcessing) return;

    setUiError(null);
    const userText = inputPrompt.trim();
    setInputPrompt("");
    updateProcessingState(true);
    setAgentStatus("🤔 AI agent planning layout...");
    setAgentLogs([]);

    // Optimistically add user message to UI
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const timeoutId = setTimeout(() => {
      updateProcessingState(false);
      setAgentStatus(null);
      setUiError("Request timed out. The AI agent may still be building complex components. Please check preview or retry.");
    }, 180000);

    try {
      let url = buildApiUrl(`/agent/projects/${projectId}/prompt`);
      if (activeConversationId) {
        url = buildApiUrl(`/projects/${projectId}/conversations/${activeConversationId}/messages`);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: userText, prompt: userText }),
      });

      const data = await safeParseResponse(res);
      clearTimeout(timeoutId);
      updateProcessingState(false);
      setAgentStatus(null);

      // Trigger file deletions in React workspace state
      const deletedFiles = data.deletedFiles || [];
      if (Array.isArray(deletedFiles) && onFileDeleted) {
        deletedFiles.forEach((delPath: string) => {
          if (delPath) onFileDeleted(delPath);
        });
      }

      // Trigger file updates in React workspace state for returned changes
      const changes = data.changes || data.fileChanges || [];
      if (Array.isArray(changes) && onFileUpdated) {
        changes.forEach((change: { path: string; content: string }) => {
          if (change.path && change.content) {
            onFileUpdated(change.path, change.content);
          }
        });
      }

      // Ensure returned user & assistant messages are in proper chronological order
      if (data.message) {
        let assistantContent = "";
        let assistantId = `asst-${Date.now()}`;
        let assistantCreatedAt = new Date().toISOString();
        if (typeof data.message === "object" && data.message !== null && data.message.content) {
          assistantContent = data.message.content;
          assistantId = data.message.id || assistantId;
          assistantCreatedAt = data.message.created_at || assistantCreatedAt;
        } else if (typeof data.message === "string") {
          assistantContent = data.message;
        }

        if (assistantContent) {
          const finalUserMsg: Message = data.userMessage || tempUserMsg;
          const assistantMsgObj: Message = {
            id: assistantId,
            role: "assistant",
            content: assistantContent,
            created_at: assistantCreatedAt,
          };

          setMessages((prev) => {
            let replacedUser = false;
            // 1. Replace tempUserMsg in-place to strictly preserve prompt order
            const updated = prev.map((m) => {
              if (m.id === tempUserMsg.id) {
                replacedUser = true;
                return finalUserMsg;
              }
              return m;
            });

            // If tempUserMsg wasn't found in array, ensure finalUserMsg is present
            if (!replacedUser && !updated.some((m) => m.id === finalUserMsg.id)) {
              updated.push(finalUserMsg);
            }

            // 2. Check if assistant response was already appended (e.g., via SSE)
            const alreadyHasAssistant = updated.some(
              (m) =>
                m.role === "assistant" &&
                (m.id === assistantMsgObj.id || m.content === assistantContent)
            );

            if (!alreadyHasAssistant) {
              updated.push(assistantMsgObj);
            }

            return sortMessagesChronologically(updated);
          });
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setUiError(err.message || "Unable to connect to AI backend.");
      updateProcessingState(false);
      setAgentStatus(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitPrompt();
    }
  };

  return (
    <div
      className={`w-80 border-r flex flex-col h-full select-none transition-colors ${
        isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-200"
      }`}
    >
      {/* Header & New Chat Button */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950"}`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            AI Agent Assistant
          </span>
        </div>

        <button
          onClick={handleCreateNewChat}
          className="flex items-center space-x-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors"
          title="Create New Conversation Thread"
        >
          <Plus className="w-3 h-3" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Persistent Conversation Threads List */}
      {conversations.length > 0 && (
        <div className={`px-3 py-2 border-b flex items-center space-x-1 overflow-x-auto no-scrollbar ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900/60 border-slate-800/80"}`}>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConversationId(c.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                activeConversationId === c.id
                  ? "bg-indigo-600 text-white font-medium"
                  : isLight
                  ? "bg-white text-slate-600 hover:text-slate-900 border border-slate-300"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>{c.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {uiError && (
        <div className="m-3 p-2.5 bg-red-950/80 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center space-x-2 [overflow-wrap:anywhere] break-words">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{uiError}</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isProcessing && (
          <div className={`p-4 border rounded-xl text-center space-y-2 my-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/50 border-slate-800"}`}>
            <Bot className="w-8 h-8 text-indigo-500 mx-auto" />
            <p className={`text-xs font-medium ${isLight ? "text-slate-800" : "text-white"}`}>Ask AI to build or modify code</p>
            <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              e.g. "Add a landing page for a coffee shop" or "Make the hero section dark blue with Tailwind"
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : isLight
                  ? "bg-slate-100 text-indigo-600 border border-slate-300"
                  : "bg-slate-800 text-indigo-400 border border-slate-700"
              }`}
            >
              {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] break-words ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : isLight
                  ? "bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Live SSE Agent Logs */}
        {isProcessing && (
          <div className={`border rounded-xl p-3 text-xs space-y-2 ${isLight ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-900/80 border-indigo-500/30"}`}>
            <div className="flex items-center space-x-2 text-indigo-600 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>{agentStatus || "AI Agent Working..."}</span>
            </div>

            {agentLogs.length > 0 && (
              <div className={`p-2 rounded border font-mono text-[10px] space-y-1 max-h-32 overflow-y-auto [overflow-wrap:anywhere] break-words ${isLight ? "bg-white border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-400"}`}>
                {agentLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-1">
                    <Terminal className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Input Form */}
      <form onSubmit={(e) => handleSubmitPrompt(e)} className={`p-3 border-t ${isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
        <div className="relative flex items-end">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isProcessing ? "AI Agent thinking..." : "Describe what to build..."}
            className={`w-full pl-3.5 pr-10 py-2.5 border rounded-xl text-xs resize-none min-h-[64px] max-h-32 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                : "bg-slate-900 border-slate-800 text-white placeholder-slate-500"
            }`}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isProcessing}
            className="absolute right-2 bottom-3 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className={`mt-1.5 flex items-center justify-between text-[10px] px-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
          <span>Enter to send • Shift + Enter for new line</span>
        </div>
      </form>
    </div>
  );
};
