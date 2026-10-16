import React, { useState } from "react";
import { Sparkles, Code2, Monitor, Tablet, Smartphone, Check, Copy, ArrowRight, Play } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface DemoScenario {
  id: string;
  name: string;
  prompt: string;
  badge: string;
  codeSnippet: string;
  previewContent: {
    title: string;
    description: string;
    tag: string;
    stats: { label: string; val: string }[];
    actionText: string;
  };
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "saas",
    name: "SaaS Analytics",
    badge: "Dashboard",
    prompt: "Generate a high-converting SaaS analytics portal with KPI stats, graph cards, and dark theme support.",
    codeSnippet: `import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [metric, setMetric] = useState('revenue');
  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-white">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Analytics Overview</h2>
          <p className="text-xs text-slate-400">Real-time performance metrics</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">● Live</span>
      </header>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/60 rounded-xl">
          <p className="text-xs text-slate-400">MRR</p>
          <p className="text-2xl font-black text-indigo-400">$34,820</p>
        </div>
      </div>
    </div>
  );
}`,
    previewContent: {
      title: "Enterprise Growth & Metrics",
      description: "Real-time subscription ARR, churn tracking, and automated multi-tenant customer insights.",
      tag: "Vite + Tailwind",
      stats: [
        { label: "Monthly Recurring", val: "$48,920" },
        { label: "Active Cohort", val: "1,240 Users" },
        { label: "Net Retention", val: "114.2%" },
      ],
      actionText: "Export Metrics CSV",
    },
  },
  {
    id: "ecommerce",
    name: "Modern E-Commerce",
    badge: "Storefront",
    prompt: "Build a sleek coffee roastery shop with product filters, responsive grid, and cart drawer.",
    codeSnippet: `import React, { useState } from 'react';
import { ShoppingBag, Star, Plus } from 'lucide-react';

export default function CoffeeShop() {
  const [cartCount, setCartCount] = useState(2);
  return (
    <div className="p-6 bg-slate-950 text-white rounded-2xl">
      <nav className="flex justify-between items-center mb-6">
        <span className="font-bold tracking-tight">AROMA ROASTERS</span>
        <button className="flex items-center space-x-2 bg-indigo-600 px-3 py-1.5 rounded-lg text-xs">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Cart ({cartCount})</span>
        </button>
      </nav>
      {/* Product Grid */}
    </div>
  );
}`,
    previewContent: {
      title: "Artisanal Single-Origin Roastery",
      description: "Crafted roasted beans sourced directly from sustainable high-elevation micro-lots.",
      tag: "Cart + Checkout",
      stats: [
        { label: "Beans In Stock", val: "18 Varieties" },
        { label: "Roast Rating", val: "4.92 / 5.0" },
        { label: "Free Shipping", val: "Orders > $45" },
      ],
      actionText: "Add Signature Blend ($18)",
    },
  },
  {
    id: "portfolio",
    name: "Design Portfolio",
    badge: "Showcase",
    prompt: "Create an interactive creative portfolio with bold typography, project grid, and contact form.",
    codeSnippet: `import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function Portfolio() {
  return (
    <div className="p-8 bg-zinc-950 text-white rounded-2xl">
      <h1 className="text-3xl font-extrabold mb-3">Elena Vance</h1>
      <p className="text-zinc-400 text-sm mb-6">Staff Product Designer & Creative Technologist</p>
    </div>
  );
}`,
    previewContent: {
      title: "Elena Vance • Product Designer",
      description: "Designing thoughtful digital experiences, generative interfaces, and high-performance design systems.",
      tag: "React 18",
      stats: [
        { label: "Featured Works", val: "12 Case Studies" },
        { label: "Industry Awards", val: "5 Awwwards" },
        { label: "Client NPS", val: "98% Positive" },
      ],
      actionText: "Schedule Introduction",
    },
  },
];

export const LandingPreviewDemo: React.FC = () => {
  const { isDark } = useTheme();
  const [activeScenarioId, setActiveScenarioId] = useState("saas");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [deviceViewport, setDeviceViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const scenario = DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scenario.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getViewportMaxWidth = () => {
    if (deviceViewport === "mobile") return "max-w-xs";
    if (deviceViewport === "tablet") return "max-w-md";
    return "max-w-full";
  };

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Live Sandbox Architecture</span>
        </div>
        <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
          See the AI Engine in Action
        </h2>
        <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Test different prompts below to inspect the generated React components, hot-reloading sandbox, and clean code output.
        </p>

        {/* Blueprint Scenario Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {DEMO_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioId(s.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeScenarioId === s.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mock Studio Window Container */}
      <div
        className={`rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? "border-slate-800 bg-slate-900/70 backdrop-blur-xl"
            : "border-slate-200 bg-white/95 shadow-indigo-500/5 backdrop-blur-xl"
        }`}
      >
        {/* macOS Window Title Bar */}
        <div
          className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-slate-50/90"
          }`}
        >
          {/* Window dots & simulated file tab */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div
              className={`px-3 py-1 rounded-lg font-mono text-[11px] border flex items-center space-x-1.5 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>src/components/{scenario.name.replace(/\s+/g, "")}.tsx</span>
            </div>
          </div>

          {/* Viewport switch & Code / Preview toggle */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Viewport Width Controls */}
            <div
              className={`hidden sm:flex items-center p-0.5 rounded-lg border ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <button
                onClick={() => setDeviceViewport("desktop")}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceViewport === "desktop"
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceViewport("tablet")}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceViewport === "tablet"
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceViewport("mobile")}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceViewport === "mobile"
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle Code / Preview */}
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <button
                onClick={() => setViewMode("preview")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  viewMode === "preview"
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  viewMode === "code"
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Inspect Code
              </button>
            </div>
          </div>
        </div>

        {/* Prompt Input Strip */}
        <div
          className={`px-4 py-2.5 border-b flex items-center justify-between text-xs gap-3 ${
            isDark ? "border-slate-800/80 bg-slate-950/50" : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-500 shrink-0">
              <Sparkles className="w-3 h-3" />
            </span>
            <span className={`font-mono truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              AI: "{scenario.prompt}"
            </span>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            ● Hot Reloaded in 240ms
          </span>
        </div>

        {/* Main Preview / Code Viewport Container */}
        <div className="p-4 sm:p-8 flex justify-center items-center min-h-[380px]">
          {viewMode === "preview" ? (
            <div
              className={`w-full transition-all duration-300 ${getViewportMaxWidth()} rounded-2xl border p-6 sm:p-8 shadow-xl ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-white"
                  : "bg-white border-slate-200 text-slate-900 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {scenario.previewContent.tag}
                </span>
                <span className="text-xs text-slate-400 font-mono">React 18.2</span>
              </div>

              <h3 className={`text-xl sm:text-2xl font-black mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                {scenario.previewContent.title}
              </h3>

              <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {scenario.previewContent.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {scenario.previewContent.stats.map((st, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">
                      {st.label}
                    </p>
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {st.val}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>{scenario.previewContent.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-full relative">
              <button
                onClick={handleCopyCode}
                className={`absolute top-3 right-3 px-2.5 py-1.5 rounded-lg border text-xs flex items-center space-x-1.5 transition-colors cursor-pointer z-10 ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>

              <pre
                className={`p-4 sm:p-6 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] border leading-relaxed ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-indigo-300"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <code>{scenario.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
