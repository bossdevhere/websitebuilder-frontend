import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Terminal, Plus, MessageSquare, AlertTriangle } from "lucide-react";

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
      const res = await fetch(`/api/projects/${projectId}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unable to load conversations");
      const data = await res.json();
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
      const res = await fetch(`/api/projects/${projectId}/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (err: any) {
      console.warn("Message fetch fallback:", err.message);
      fetch(`/api/agent/projects/${projectId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.messages && d.messages.length > 0) setMessages(d.messages);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else if (projectId && token) {
      fetch(`/api/agent/projects/${projectId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.messages && d.messages.length > 0) setMessages(d.messages);
        })
        .catch(() => {});
    }
  }, [activeConversationId, projectId, token]);

  // Connect Server-Sent Events (SSE) Stream
  useEffect(() => {
    if (!projectId || !token) return;

    const sseUrl = `/api/agent/projects/${projectId}/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE Message]", data);
      } catch (e) {}
    };

    eventSource.addEventListener("status", (event: any) => {
      const data = JSON.parse(event.data);
      setAgentStatus(data.message || data.status);
      if (data.logs) setAgentLogs(data.logs);

      if (data.status === "done" || data.status === "error") {
        updateProcessingState(false);
        setAgentStatus(null);
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
      const res = await fetch(`/api/projects/${projectId}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: `Chat ${conversations.length + 1}` }),
      });
      if (!res.ok) throw new Error("Conversation creation failed");
      const data = await res.json();
      if (data.conversation) {
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);
        setMessages([]);
      }
    } catch (err: any) {
      setUiError("Conversation could not be created.");
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
    }, 45000);

    try {
      let url = `/api/agent/projects/${projectId}/prompt`;
      if (activeConversationId) {
        url = `/api/projects/${projectId}/conversations/${activeConversationId}/messages`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: userText, prompt: userText }),
      });

      if (!res.ok) {
        clearTimeout(timeoutId);
        const errData = await res.json();
        throw new Error(errData.error || "Agent execution failed");
      }

      const data = await res.json();
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

      // Append returned user & assistant messages directly into UI state so they NEVER disappear
      if (data.message) {
        let assistantMsgObj: Message;
        if (typeof data.message === "object" && data.message !== null && data.message.content) {
          assistantMsgObj = data.message;
        } else {
          assistantMsgObj = {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: typeof data.message === "string" ? data.message : JSON.stringify(data.message),
            created_at: new Date().toISOString(),
          };
        }

        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
          const finalUserMsg = data.userMessage || tempUserMsg;
          return [...filtered, finalUserMsg, assistantMsgObj];
        });
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setUiError(err.message || "Unable to connect to AI backend.");
      setIsProcessing(false);
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
