import React from "react";
import { MessageSquareText, Cpu, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface Step {
  num: string;
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  tag: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    icon: MessageSquareText,
    title: "Describe Your Vision",
    description: "Tell the agent what you want to build in everyday language, or choose from our curated blueprints to jumpstart your project with ready-to-use patterns.",
    tag: "Natural Language Prompting",
  },
  {
    num: "02",
    icon: Cpu,
    title: "AI Architect Builds in Real-Time",
    description: "The autonomous agent breaks down the problem, creates modular React components, wires up state hooks, and resolves dependencies on the fly.",
    tag: "Autonomous Code Generation",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Live Preview & Export Code",
    description: "Interact with your running app in the live sandboxed viewport. Edit with Monaco code editor or export a full Vite + Tailwind ZIP codebase with one click.",
    tag: "Production Ready Code",
  },
];

export const LandingWorkflow: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-12 border-t border-b transition-colors border-slate-200 dark:border-slate-800/80">
      <div className="text-center mb-14">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple 3-Step Process</span>
        </div>
        <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
          How AI Web Studio Works
        </h2>
        <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          From idea to a functioning, production-ready React codebase with zero tedious setup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className={`relative rounded-2xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-200 ${
                isDark
                  ? "bg-slate-900/50 border-slate-800 hover:border-slate-700 shadow-xl"
                  : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/25">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-indigo-500/40">
                    {step.num}
                  </span>
                </div>

                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full mb-3">
                  {step.tag}
                </span>

                <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                  {step.title}
                </h3>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {step.description}
                </p>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm ${
                      isDark ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
