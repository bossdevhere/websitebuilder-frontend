import React from "react";
import { ArrowRight } from "lucide-react";
import { StarterTemplate } from "../../types";

interface StarterTemplateCardProps {
  template: StarterTemplate;
  onSelect: (template: StarterTemplate) => void;
}

export const StarterTemplateCard: React.FC<StarterTemplateCardProps> = ({ template, onSelect }) => {
  const IconComp = template.icon;

  return (
    <div
      onClick={() => onSelect(template)}
      className="group relative rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-500/50 cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
    >
      <div className="h-28 overflow-hidden relative">
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
          {template.category}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors mb-1 flex items-center space-x-1.5">
            <IconComp className="w-3.5 h-3.5 text-indigo-400" />
            <span>{template.title}</span>
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
          <span>Use Template</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
