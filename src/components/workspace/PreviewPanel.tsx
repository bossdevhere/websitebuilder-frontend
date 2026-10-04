import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone } from "lucide-react";

interface ProjectFile {
  path: string;
  content: string;
}

interface PreviewPanelProps {
  files: ProjectFile[];
  activeFilePath?: string | null;
  previewUrl?: string | null;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ files, previewUrl }) => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-refresh iframe when project files change
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [files]);

  // Generate self-contained sandboxed HTML doc with Babel Standalone & React UMD
  const generateSrcDoc = (): string => {
    const indexHtmlFile = files.find(
      (f) => f.path === "index.html" || f.path === "/index.html" || f.path.endsWith("/index.html")
    );

    const cssFiles = files.filter((f) => f.path.endsWith(".css"));
    const combinedCss = cssFiles.map((f) => `/* ${f.path} */\n${f.content}`).join("\n\n");

    const isAppFile = (f: ProjectFile) =>
      f.path.endsWith("App.tsx") ||
      f.path.endsWith("App.jsx") ||
      f.path.endsWith("App.js") ||
      f.path.endsWith("main.tsx") ||
      f.path.endsWith("index.tsx") ||
      f.path.endsWith("index.js");

    const mainJsFile = files.find(isAppFile);

    const componentFiles = files.filter(
      (f) => (f.path.endsWith(".tsx") || f.path.endsWith(".jsx") || f.path.endsWith(".js")) && !isAppFile(f)
    );

    const modulePolyfill = `
      <script>
        window.exports = {};
        window.module = { exports: window.exports };
        window.componentRegistry = {};
        
        window.require = function(moduleName) {
          if (moduleName === 'react') return window.React;
          if (moduleName === 'react-dom' || moduleName === 'react-dom/client') return window.ReactDOM;
          if (moduleName === 'lucide-react') return window.lucide || {};
          
          const cleanName = moduleName.replace(/^\\.\\//, '').replace(/^\\.\\.\\//, '');
          if (window.componentRegistry[cleanName]) {
            return window.componentRegistry[cleanName];
          }
          return window.exports;
        };
      </script>
    `;

    const reactHeader = `
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      ${modulePolyfill}
    `;

    const wrapComponentScript = (file: ProjectFile) => `
      <script type="text/babel">
        (function() {
          var exports = {};
          var module = { exports: exports };
          try {
            ${file.content}
            var exported = module.exports.default || module.exports.App || exports.default || exports.App || (typeof App !== 'undefined' ? App : null);
            if (exported) {
              var pathKey = "${file.path.replace(/\.[^/.]+$/, "")}";
              window.componentRegistry[pathKey] = { default: exported, App: exported };
              window.componentRegistry["./" + pathKey] = { default: exported, App: exported };
              window.componentRegistry["../" + pathKey] = { default: exported, App: exported };
              if (!window.exports.default && !window.exports.App) {
                window.exports.default = exported;
                window.exports.App = exported;
              }
            }
          } catch (err) {
            console.error("Error evaluating ${file.path}:", err);
          }
        })();
      </script>
    `;

    const componentScriptsHtml = componentFiles.map(wrapComponentScript).join("\n");
    const mainScriptHtml = mainJsFile ? wrapComponentScript(mainJsFile) : "";

    const mountRenderScript = `
      <script type="text/babel">
        try {
          let TargetComponent = window.exports.default || window.exports.App;
          if (!TargetComponent && typeof App !== 'undefined') {
            TargetComponent = App;
          }
          if (!TargetComponent) {
            const keys = Object.keys(window.componentRegistry);
            if (keys.length > 0) {
              TargetComponent = window.componentRegistry[keys[0]].default;
            }
          }
          if (TargetComponent) {
            const rootElement = document.getElementById('root') || document.body;
            ReactDOM.createRoot(rootElement).render(React.createElement(TargetComponent));
          } else {
            document.getElementById('root').innerHTML = '<div style="padding: 2rem; font-family: sans-serif; color: #94a3b8; text-align: center;"><h2 style="font-size: 1.25rem; font-weight: 600; color: #818cf8; margin-bottom: 0.5rem;">Web Application Preview</h2><p>Your workspace is ready. Ask the AI assistant on the left to create components!</p></div>';
          }
        } catch (err) {
          console.error(err);
          document.getElementById('root').innerHTML = '<div style="color: #f87171; padding: 20px; font-family: monospace;">Runtime Error: ' + err.message + '</div>';
        }
      </script>
    `;

    if (indexHtmlFile && indexHtmlFile.content.trim().length > 0) {
      let html = indexHtmlFile.content;

      if (!html.includes("react.development.js")) {
        html = html.replace("<head>", `<head>\n${reactHeader}`);
      } else {
        html = html.replace("<head>", `<head>\n${modulePolyfill}`);
      }

      if (combinedCss.trim().length > 0) {
        html = html.replace(
          "</head>",
          `  <style>\n${combinedCss}\n</style>\n</head>`
        );
      }

      const allScripts = `${componentScriptsHtml}\n${mainScriptHtml}\n${mountRenderScript}`;
      html = html.replace("</body>", `${allScripts}\n</body>`);

      return html;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  ${reactHeader}
  <style>
    ${combinedCss}
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
  <div id="root"></div>
  ${componentScriptsHtml}
  ${mainScriptHtml}
  ${mountRenderScript}
</body>
</html>`;
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
      return;
    }
    const srcDoc = generateSrcDoc();
    const win = window.open();
    if (win) {
      win.document.open();
      win.document.write(srcDoc);
      win.document.close();
    }
  };

  const getViewportDimensions = () => {
    switch (viewportMode) {
      case "mobile":
        return "w-[375px] h-[667px] shadow-2xl rounded-2xl border-4 border-slate-800";
      case "tablet":
        return "w-[768px] h-[90%] shadow-2xl rounded-xl border-4 border-slate-800";
      case "desktop":
      default:
        return "w-full h-full";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full overflow-hidden border-l border-slate-800">
      {/* Preview Header Toolbar */}
      <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-3 flex items-center justify-between select-none">
        <div className="flex items-center space-x-1">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider px-2">
            Live Preview
          </span>
          <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-mono">
            Live Sandboxed Engine
          </span>
        </div>

        {/* Viewport Modes */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewportMode("desktop")}
            className={`p-1.5 rounded text-xs flex items-center space-x-1 transition-colors ${
              viewportMode === "desktop"
                ? "bg-indigo-600 text-white font-medium"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
            title="Desktop Mode (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewportMode("tablet")}
            className={`p-1.5 rounded text-xs flex items-center space-x-1 transition-colors ${
              viewportMode === "tablet"
                ? "bg-indigo-600 text-white font-medium"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
            title="Tablet Mode (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewportMode("mobile")}
            className={`p-1.5 rounded text-xs flex items-center space-x-1 transition-colors ${
              viewportMode === "mobile"
                ? "bg-indigo-600 text-white font-medium"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
            title="Mobile Mode (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Refresh Sandbox Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sandbox IFrame Container */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-auto">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          srcDoc={generateSrcDoc()}
          title="App Live Preview"
          sandbox="allow-scripts allow-modals allow-same-origin"
          className={`bg-slate-900 transition-all duration-300 ${getViewportDimensions()}`}
        />
      </div>
    </div>
  );
};
