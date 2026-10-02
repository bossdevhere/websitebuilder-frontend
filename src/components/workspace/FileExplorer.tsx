import React, { useState } from "react";
import { ProjectFile } from "../../services/api";
import { FileCode, Folder, Plus, Trash2, FileText, ChevronRight, ChevronDown } from "lucide-react";

interface FileExplorerProps {
  files: ProjectFile[];
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [newFileName, setNewFileName] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);

  const handleAddFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onCreateFile(newFileName.trim());
    setNewFileName("");
    setIsAddingFile(false);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".jsx") || path.endsWith(".ts") || path.endsWith(".js")) {
      return <FileCode className="w-4 h-4 text-blue-400" />;
    }
    if (path.endsWith(".html")) {
      return <FileText className="w-4 h-4 text-orange-400" />;
    }
    if (path.endsWith(".json")) {
      return <FileText className="w-4 h-4 text-yellow-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Explorer
        </span>
        <button
          onClick={() => setIsAddingFile(!isAddingFile)}
          title="New File"
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isAddingFile && (
        <form onSubmit={handleAddFileSubmit} className="p-2 border-b border-slate-800">
          <input
            type="text"
            autoFocus
            placeholder="filename.tsx"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => {
              if (!newFileName.trim()) setIsAddingFile(false);
            }}
            className="w-full px-2.5 py-1 text-sm bg-slate-900 border border-indigo-500 rounded text-white focus:outline-none"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {files.length === 0 ? (
          <div className="p-4 text-xs text-slate-500 text-center">No files in project</div>
        ) : (
          files.map((file) => {
            const isActive = activeFilePath === file.path;
            return (
              <div
                key={file.path}
                onClick={() => onSelectFile(file.path)}
                className={`group flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer border-l-2 transition-colors ${
                  isActive
                    ? "bg-slate-900 border-indigo-500 text-white font-medium"
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
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-opacity"
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
