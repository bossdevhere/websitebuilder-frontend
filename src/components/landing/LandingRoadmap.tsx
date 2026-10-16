import React, { useState } from "react";
import {
  Globe,
  Database,
  Smartphone,
  Palette,
  Users,
  Bot,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Layers,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

type Category = "all" | "cloud" | "backend" | "visual" | "agents";

interface RoadmapItem {
  id: string;
  category: "cloud" | "backend" | "visual" | "agents";
  title: string;
  quarter: string;
  status: "In Development" | "Beta Testing" | "Coming Soon" | "In Research";
  statusColor: string;
  progress: number;
  description: string;
  highlights: string[];
  techStack: string[];
  initialVotes: number;
  icon: React.FC<{ className?: string }>;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: "custom-domain",
    category: "cloud",
    title: "1-Click Custom Domain & Vercel Publishing",
    quarter: "Q1 2026",
    status: "Beta Testing",
    statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    progress: 90,
    description: "Deploy projects straight to global edge CDNs with automatic SSL provisioning, custom domain DNS mapping, and continuous production redeploys.",
    highlights: ["Automated Let's Encrypt SSL", "Custom apex & subdomain routing", "Instant 1-click Vercel & Netlify sync"],
    techStack: ["Vercel API", "Cloudflare DNS", "Edge CDN"],
    initialVotes: 342,
    icon: Globe,
  },
  {
    id: "fullstack-db",
    category: "backend",
    title: "Full-Stack Database & Supabase Auto-Wiring",
    quarter: "Q2 2026",
    status: "In Development",
    statusColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    progress: 75,
    description: "Empower the agent to provision relational database tables, generate secure RLS policies, and wire up instant CRUD API routes directly through conversational chat.",
    highlights: ["Auto-generated PostgreSQL migrations", "Secure Supabase Auth integrations", "REST & GraphQL endpoint scaffolding"],
    techStack: ["PostgreSQL", "Supabase", "Prisma ORM"],
    initialVotes: 489,
    icon: Database,
  },
  {
    id: "visual-editor",
    category: "visual",
    title: "Click-to-Edit Visual Canvas & Figma Ingestion",
    quarter: "Q2 2026",
    status: "In Development",
    statusColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    progress: 65,
    description: "Click any element in the live preview to modify styles visually or prompt the AI to refactor that specific component. Import Figma design frames directly into clean React code.",
    highlights: ["Interactive AST element selector", "Figma-to-React frame parser", "Two-way code & visual sync"],
    techStack: ["Babel AST", "Figma REST API", "Tailwind Parser"],
    initialVotes: 612,
    icon: Palette,
  },
  {
    id: "mobile-native",
    category: "visual",
    title: "Cross-Platform Mobile App Export (React Native)",
    quarter: "Q3 2026",
    status: "Coming Soon",
    statusColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    progress: 40,
    description: "Export web applications into native iOS and Android projects powered by React Native and Expo, with universal Tailwind styling across mobile and web.",
    highlights: ["Expo EAS automated build configs", "Native mobile navigation stacks", "Universal responsive components"],
    techStack: ["React Native", "Expo SDK", "NativeWind"],
    initialVotes: 275,
    icon: Smartphone,
  },
  {
    id: "multi-agent-team",
    category: "agents",
    title: "Specialized Multi-Agent Swarm (Architect, Dev, QA)",
    quarter: "Q3 2026",
    status: "In Research",
    statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    progress: 35,
    description: "Harness a team of autonomous AI agents working in harmony: a System Architect plans data structures, a Frontend Engineer codes, and a QA Agent auto-tests runtime edge cases.",
    highlights: ["Autonomous self-healing test loops", "Design system consistency audits", "Automated Playwright smoke testing"],
    techStack: ["LangGraph Multi-Agent", "Playwright", "Gemini 2.5 Pro"],
    initialVotes: 518,
    icon: Bot,
  },
  {
    id: "multiplayer",
    category: "cloud",
    title: "Real-Time Multiplayer Pair Programming",
    quarter: "Q4 2026",
    status: "In Research",
    statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    progress: 25,
    description: "Invite teammates to build alongside you with live presence, shared cursor tracking, shared conversational prompt history, and granular team permission roles.",
    highlights: ["Real-time collaborative Monaco editor", "Shared agent context & prompt queue", "Branching & preview merging"],
    techStack: ["WebSockets", "CRDTs", "Role-Based Access"],
    initialVotes: 198,
    icon: Users,
  },
];

export const LandingRoadmap: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [votes, setVotes] = useState<Record<string, number>>(
    ROADMAP_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.initialVotes }), {})
  );
  const [votedItems, setVotedItems] = useState<Record<string, boolean>>({});

  const handleVote = (id: string) => {
    if (votedItems[id]) {
      setVotes((prev) => ({ ...prev, [id]: prev[id] - 1 }));
      setVotedItems((prev) => ({ ...prev, [id]: false }));
    } else {
      setVotes((prev) => ({ ...prev, [id]: prev[id] + 1 }));
      setVotedItems((prev) => ({ ...prev, [id]: true }));
    }
  };

  const filteredItems = ROADMAP_ITEMS.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  return (
    <section id="roadmap" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-12">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Evolution • Future Upgrades</span>
        </div>
        <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
          Next-Gen Upgrades & Innovation Roadmap
        </h2>
        <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          We are continuously advancing the autonomous builder. Explore upcoming architectural enhancements,
          vote on the features you want prioritized, and track our engineering progress in real time.
        </p>

        {/* Filter Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {[
            { id: "all", label: "All Upgrades" },
            { id: "cloud", label: "Cloud & Deploy" },
            { id: "backend", label: "Full-Stack & DB" },
            { id: "visual", label: "Visual & Mobile" },
            { id: "agents", label: "Multi-Agent AI" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as Category)}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25"
                  : isDark
                  ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upgrades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isVoted = votedItems[item.id];
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl relative overflow-hidden group ${
                isDark
                  ? "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div>
                {/* Card Top: Icon, Quarter, Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border border-slate-700/60 bg-slate-800/60 text-slate-300">
                      {item.quarter}
                    </span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <h3 className={`text-base sm:text-lg font-bold mb-2 group-hover:text-indigo-500 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h3>

                <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {item.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="flex justify-between items-center text-[11px] mb-1.5 font-medium">
                    <span className={isDark ? "text-slate-400" : "text-slate-500"}>Development Progress</span>
                    <span className="text-indigo-500 font-bold">{item.progress}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-1.5 mb-5 text-xs">
                  {item.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer: Tech Tags & Upvote Button */}
              <div
                className={`pt-4 border-t flex items-center justify-between gap-2 ${
                  isDark ? "border-slate-800/80" : "border-slate-100"
                }`}
              >
                <div className="flex flex-wrap gap-1">
                  {item.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        isDark
                          ? "bg-slate-950/80 border-slate-800 text-slate-400"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVote(item.id)}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isVoted
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : isDark
                      ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                  title="Vote to prioritize this feature"
                >
                  <ThumbsUp className={`w-3 h-3 ${isVoted ? "fill-white" : ""}`} />
                  <span>{votes[item.id]}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Request Callout */}
      <div
        className={`mt-10 p-6 rounded-2xl border text-center max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark
            ? "bg-gradient-to-r from-slate-900/60 to-indigo-950/40 border-slate-800"
            : "bg-gradient-to-r from-slate-50 to-indigo-50/60 border-slate-200 shadow-sm"
        }`}
      >
        <div className="text-left">
          <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Have an idea for a feature or custom integration?
          </h4>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Our engineering team prioritizes upgrades driven directly by developer feedback.
          </p>
        </div>
        <a
          href="https://github.com/bossdevhere/websitebuilder-frontend/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/25 shrink-0 transition-all cursor-pointer"
        >
          <span>Submit Request</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};
