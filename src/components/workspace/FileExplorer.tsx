import React, { useState } from "react";
import { ProjectFile } from "../../services/api";
import { FileCode, Plus, Trash2, FileText } from "lucide-react";

interface FileExplorerProps {
  files: ProjectFile[];
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  theme?: "dark" | "light";
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  theme = "dark",
}) => {
  const [newFileName, setNewFileName] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);

  const isLight = theme === "light";

  const handleAddFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onCreateFile(newFileName.trim());
    setNewFileName("");
    setIsAddingFile(false);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".jsx") || path.endsWith(".ts") || path.endsWith(".js")) {
      return <FileCode className="w-4 h-4 text-blue-500" />;
    }
    if (path.endsWith(".html")) {
      return <FileText className="w-4 h-4 text-orange-500" />;
    }
    if (path.endsWith(".json")) {
      return <FileText className="w-4 h-4 text-amber-500" />;
    }
    return <FileText className={`w-4 h-4 ${isLight ? "text-slate-400" : "text-slate-400"}`} />;
  };

  return (
    <div
      className={`w-64 flex flex-col h-full select-none border-r transition-colors ${
        isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-200"
      }`}
    >
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${
          isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950"
        }`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isLight ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Explorer
        </span>
        <button
          onClick={() => setIsAddingFile(!isAddingFile)}
          title="New File"
          className={`p-1 rounded transition-colors ${
            isLight
              ? "hover:bg-slate-200 text-slate-600 hover:text-slate-900"
              : "hover:bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isAddingFile && (
        <form onSubmit={handleAddFileSubmit} className={`p-2 border-b ${isLight ? "border-slate-200 bg-slate-100" : "border-slate-800 bg-slate-900"}`}>
          <input
            type="text"
            autoFocus
            placeholder="filename.tsx"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => {
              if (!newFileName.trim()) setIsAddingFile(false);
            }}
            className={`w-full px-2.5 py-1 text-sm border rounded focus:outline-none ${
              isLight
                ? "bg-white border-indigo-500 text-slate-900"
                : "bg-slate-900 border-indigo-500 text-white"
            }`}
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {files.length === 0 ? (
          <div className={`p-4 text-xs text-center ${isLight ? "text-slate-400" : "text-slate-500"}`}>
            No files in project
          </div>
        ) : (
          files.map((file) => {
            const isActive = activeFilePath === file.path;
            return (
              <div
                key={file.path}
                onClick={() => onSelectFile(file.path)}
                className={`group flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer border-l-2 transition-colors ${
                  isActive
                    ? isLight
                      ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-medium"
                      : "bg-slate-900 border-indigo-500 text-white font-medium"
                    : isLight
                    ? "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    : "border-transparent text-slate-300 hover:bg-slate-900/60 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {getFileIcon(file.path)}
                  <span className="truncate">{file.path}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete ${file.path}?`)) {
                      onDeleteFile(file.path);
                    }
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity ${
                    isLight ? "text-slate-400" : "text-slate-500"
                  }`}
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
