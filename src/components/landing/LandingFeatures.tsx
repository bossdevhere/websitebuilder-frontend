import React from "react";
import { Code2, Play, Terminal, Download, Bot, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface FeatureCard {
  icon: React.FC<{ className?: string }>;
  color: string;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
}

const FEATURES: FeatureCard[] = [
  {
    icon: Code2,
    color: "from-blue-500 to-indigo-600",
    badge: "Architecture",
    title: "Multi-File React Structures",
    description: "The AI agent structures complete modular projects with components, helper hooks, and styling rather than single tangled scripts.",
    bullets: ["Split components (Nav, Card, Hero)", "Proper React 18 props & hooks", "Clean standard TypeScript/JSX"],
  },
  {
    icon: Play,
    color: "from-emerald-500 to-teal-600",
    badge: "Runtime",
    title: "Instant In-Browser Sandbox",
    description: "Run and inspect web applications instantly. Powered by Babel Standalone in a secure sandbox with zero server-side cold starts.",
    bullets: ["Sub-second hot compilation", "Tailwind CSS & Lucide icons", "No remote containers required"],
  },
  {
    icon: Terminal,
    color: "from-purple-500 to-pink-600",
    badge: "Developer Tooling",
    title: "Integrated Monaco Editor",
    description: "Enjoy full developer control with a built-in VS Code editor experience. Switch seamlessly between conversational AI and code tweaking.",
    bullets: ["Full syntax highlighting", "Keyboard shortcuts (Cmd+S)", "Multi-tab file explorer"],
  },
  {
    icon: Download,
    color: "from-amber-500 to-orange-600",
    badge: "Portability",
    title: "1-Click Full Codebase Export",
    description: "Download a production-grade ZIP archive with Vite, Tailwind, package.json, and instructions ready for local development or Vercel.",
    bullets: ["Zero proprietary lock-in", "Standard `npm run dev` local run", "Clean git-friendly repository structure"],
  },
  {
    icon: Bot,
    color: "from-indigo-500 to-cyan-600",
    badge: "Pair Programming",
    title: "Conversational Refactoring",
    description: "Iterate effortlessly with plain English instructions. Ask the agent to refine colors, add features, or troubleshoot bugs on the fly.",
    bullets: ["Context-aware file modifications", "Undoable code alterations", "Preserves custom user edits"],
  },
  {
    icon: Cpu,
    color: "from-rose-500 to-red-600",
    badge: "Intelligence",
    title: "Gemini 2.5 Flash Engine",
    description: "Powered by modern LLM reasoning with high token throughput, low latency, and deep mastery of modern frontend frameworks.",
    bullets: ["Fast token generation", "Structured JSON tool calling", "Fallback resilient provider routing"],
  },
];

export const LandingFeatures: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-12">
      <div className="text-center mb-14">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Engineered for Speed & Quality</span>
        </div>
        <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
          Everything You Need to Ship Web Apps Fast
        </h2>
        <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          No complex DevOps, no cumbersome boilerplate. Go from concept to interactive React application in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className={`group p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-xl ${
                isDark
                  ? "bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700 hover:shadow-indigo-500/5"
                  : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${feature.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isDark
                        ? "bg-slate-800/80 text-slate-300 border-slate-700"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3 className={`text-lg font-bold mb-2 group-hover:text-indigo-500 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                  {feature.title}
                </h3>

                <p className={`text-xs sm:text-sm mb-5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {feature.description}
                </p>
              </div>

              <div
                className={`pt-4 border-t space-y-2 text-xs ${
                  isDark ? "border-slate-800/80 text-slate-300" : "border-slate-100 text-slate-700"
                }`}
              >
                {feature.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
