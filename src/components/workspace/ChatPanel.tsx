import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Terminal } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

interface ChatPanelProps {
  projectId: string;
  token: string;
  onFileUpdated?: (path: string, content: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ projectId, token, onFileUpdated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentLogs, agentStatus]);

  // Fetch chat message history
  useEffect(() => {
    if (!projectId || !token) return;

    fetch(`/api/agent/projects/${projectId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.error("Failed to load chat messages:", err));
  }, [projectId, token]);

  // Connect Server-Sent Events (SSE) Stream
  useEffect(() => {
    if (!projectId || !token) return;

    // Use EventSource or SSE polling
    const sseUrl = `/api/agent/projects/${projectId}/stream`;

    // Note: Standard EventSource does not support custom headers directly, so we use EventSource or fetch reader
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

      if (data.status === "done") {
        setIsProcessing(false);
        setAgentStatus(null);
        // Refresh chat messages
        fetch(`/api/agent/projects/${projectId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((msgData) => {
            if (msgData.messages) setMessages(msgData.messages);
          });
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
  }, [projectId, token, onFileUpdated]);

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isProcessing) return;

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

    try {
      const res = await fetch(`/api/agent/projects/${projectId}/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: userText }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to trigger agent");
      }
    } catch (err: any) {
      alert("Error sending prompt: " + err.message);
      setIsProcessing(false);
      setAgentStatus(null);
    }
  };

  return (
    <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          AI Agent Assistant
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isProcessing && (
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center space-y-2 my-4">
            <Bot className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-xs font-medium text-white">Ask AI to build or modify code</p>
            <p className="text-[11px] text-slate-400">
              e.g. "Add a navigation bar" or "Create a Counter component with increment and decrement buttons"
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
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
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

      {/* Prompt Input Form */}
      <form onSubmit={handleSubmitPrompt} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "AI Agent generating code..." : "Describe what to build..."}
            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isProcessing}
            className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
