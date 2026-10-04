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
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ projectId, token, onFileUpdated }) => {
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

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus, agentLogs]);

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
        setIsProcessing(false);
        setAgentStatus(null);
      }
    });

    eventSource.addEventListener("file_updated", (event: any) => {
      const data = JSON.parse(event.data);
      if (onFileUpdated && data.path && data.content) {
        onFileUpdated(data.path, data.content);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [projectId, token, activeConversationId, onFileUpdated]);

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
    setIsProcessing(true);
    setAgentStatus("🤔 Initiating AI agent...");
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
      setIsProcessing(false);
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
      setIsProcessing(false);
      setAgentStatus(null);

      // Append returned user & assistant messages directly into UI state so they NEVER disappear
      if (data.message) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
          const finalUserMsg = data.userMessage || tempUserMsg;
          return [...filtered, finalUserMsg, data.message];
        });
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setUiError(err.message || "Unable to connect to AI backend.");
      setIsProcessing(false);
      setAgentStatus(null);
    }
  };

  // Keyboard handler: Enter submits, Shift+Enter creates a new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitPrompt();
    }
  };

  return (
    <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Header & New Chat Button */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
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
        <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConversationId(c.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                activeConversationId === c.id
                  ? "bg-indigo-600 text-white font-medium"
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
        <div className="m-3 p-2.5 bg-red-950/80 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{uiError}</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isProcessing && (
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center space-y-2 my-4">
            <Bot className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-xs font-medium text-white">Ask AI to build or modify code</p>
            <p className="text-[11px] text-slate-400">
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
                  : "bg-slate-800 text-indigo-400 border border-slate-700"
              }`}
            >
              {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Live SSE Agent Logs */}
        {isProcessing && (
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>{agentStatus || "AI Agent Working..."}</span>
            </div>

            {agentLogs.length > 0 && (
              <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1 max-h-32 overflow-y-auto">
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

      {/* Prompt Input Form (Multiline Textarea: Enter to submit, Shift+Enter for newline) */}
      <form onSubmit={(e) => handleSubmitPrompt(e)} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="relative flex items-end">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isProcessing ? "AI Agent thinking..." : "Describe what to build... (Enter to send, Shift+Enter for new line)"}
            className="w-full pl-3.5 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[50px] max-h-32"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isProcessing}
            className="absolute right-2 bottom-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg transition-colors"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </form>
    </div>
  );
};
