import React, { useState } from "react";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Can I try the builder without creating an account?",
    a: "Yes! Click 'Try 1-Click Guest Demo' on the homepage to start building immediately with no signup, credit card, or email needed. You can explore the full agent interface and live sandbox.",
  },
  {
    q: "Can I download the code and run it on my own machine?",
    a: "Absolutely! You can export a complete production ZIP archive containing Vite, React 18, Tailwind CSS, and standard package.json. Simply extract the files, run `npm install && npm run dev`, or deploy directly to Vercel, Netlify, or AWS.",
  },
  {
    q: "How does the live sandbox work without server cold starts?",
    a: "We utilize in-browser Babel Standalone execution. Code changes are transformed and rendered safely right in your browser with instant hot reloading, so you never wait for slow virtual machine bootups.",
  },
  {
    q: "Does this run smoothly on mobile devices and budget laptops?",
    a: "Yes! The entire interface is built with lightweight CSS transforms, modular component loading, and responsive breakpoints from 320px phones up to 4K screens. We optimize animations for hardware acceleration with minimal CPU usage.",
  },
  {
    q: "Can I manually edit code or am I restricted to AI prompts?",
    a: "You have complete freedom. The workspace comes with a built-in Monaco Code Editor (the core of VS Code) featuring full syntax highlighting, keyboard shortcuts (Cmd+S / Ctrl+S), and multi-file navigation so you can tweak code whenever you prefer.",
  },
];

export const LandingFaq: React.FC = () => {
  const { isDark } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions?</span>
        </div>
        <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
          Frequently Asked Questions
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Everything you need to know about AI Web Studio, local execution, and guest demo sessions.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDark
                  ? "bg-slate-900/40 border-slate-800"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className={`text-sm sm:text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-indigo-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  className={`px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                    isDark ? "border-slate-800/80 text-slate-300" : "border-slate-100 text-slate-600"
                  }`}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
