import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Save, Check, FileCode } from "lucide-react";

interface CodeEditorProps {
  filePath: string | null;
  content: string;
  onSave: (content: string) => Promise<void>;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, content, onSave }) => {
  const [editorValue, setEditorValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const editorValueRef = useRef(editorValue);

  useEffect(() => {
    setEditorValue(content);
    editorValueRef.current = content;
  }, [filePath, content]);

  const handleEditorChange = (val: string | undefined) => {
    const v = val || "";
    setEditorValue(v);
    editorValueRef.current = v;
  };

  if (!filePath) {
    return (
      <div className="flex-1 bg-slate-900 flex items-center justify-center text-slate-500 flex-col space-y-2">
        <FileCode className="w-12 h-12 stroke-[1.5]" />
        <p className="text-sm">Select a file from the explorer to edit</p>
      </div>
    );
  }

  const getLanguage = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
    if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".json")) return "json";
    return "plaintext";
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSave(editorValueRef.current);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900">
      {/* Editor Header Bar */}
      <div className="h-10 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-slate-300 font-mono">
          <span>{filePath}</span>
          {editorValue !== content && (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
          )}
        </div>

        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors"
          title="Save file (Cmd+S / Ctrl+S)"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save (Cmd+S)"}</span>
            </>
          )}
        </button>
      </div>

      {/* Monaco Editor Component */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(filePath)}
          theme="vs-dark"
          value={editorValue}
          onChange={handleEditorChange}
          onMount={(editor, monaco) => {
            // Configure TypeScript / JavaScript compiler & diagnostic options for React JSX
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
              target: monaco.languages.typescript.ScriptTarget.Latest,
              allowNonTsExtensions: true,
              moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
              module: monaco.languages.typescript.ModuleKind.CommonJS,
              noEmit: true,
              esModuleInterop: true,
              allowJs: true,
            });

            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: false,
            });

            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: false,
            });

            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              handleSaveClick();
            });
          }}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
};
