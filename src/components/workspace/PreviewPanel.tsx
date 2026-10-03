import React, { useState, useRef } from "react";
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone } from "lucide-react";

interface ProjectFile {
  path: string;
  content: string;
}

interface PreviewPanelProps {
  files: ProjectFile[];
  activeFilePath?: string | null;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ files }) => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate self-contained sandboxed HTML doc
  const generateSrcDoc = (): string => {
    // Look for explicit index.html first
    const indexHtmlFile = files.find(
      (f) => f.path === "index.html" || f.path === "/index.html" || f.path.endsWith("/index.html")
    );

    const cssFiles = files.filter((f) => f.path.endsWith(".css"));
    const combinedCss = cssFiles.map((f) => `/* ${f.path} */\n${f.content}`).join("\n\n");

    // Separate component files and main App file
    const isAppFile = (f: ProjectFile) =>
      f.path.endsWith("App.tsx") ||
      f.path.endsWith("App.jsx") ||
      f.path.endsWith("App.js") ||
      f.path.endsWith("main.tsx") ||
      f.path.endsWith("index.tsx") ||
      f.path.endsWith("index.js");

    const mainJsFile = files.find(isAppFile);

    // Other non-main TSX/JSX component files (e.g. components/Navbar.tsx)
    const componentFiles = files.filter(
      (f) => (f.path.endsWith(".tsx") || f.path.endsWith(".jsx") || f.path.endsWith(".js")) && !isAppFile(f)
    );

    // CommonJS Module Polyfill: Allows top-level import/export to resolve in browser via Babel
    const modulePolyfill = `
      <script>
        window.exports = {};
        window.module = { exports: window.exports };
        window.require = function(moduleName) {
          if (moduleName === 'react') return window.React;
          if (moduleName === 'react-dom' || moduleName === 'react-dom/client') return window.ReactDOM;
          if (moduleName === 'lucide-react') return window.lucide || {};
          return window.exports;
        };
      </script>
    `;

    // React CDN Dependencies
    const reactHeader = `
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      ${modulePolyfill}
    `;

    // Build component scripts outside of try/catch blocks so import/export statements remain at top-level
    const componentScriptsHtml = componentFiles
      .map((f) => `<script type="text/babel">\n/* ${f.path} */\n${f.content}\n</script>`)
      .join("\n");

    const mainScriptHtml = mainJsFile
      ? `<script type="text/babel">\n/* ${mainJsFile.path} */\n${mainJsFile.content}\n</script>`
      : "";

    const mountRenderScript = `
      <script type="text/babel">
        try {
          const TargetComponent = window.exports.default || window.exports.App || (typeof App !== 'undefined' ? App : null);
          if (TargetComponent) {
            const rootElement = document.getElementById('root') || document.body;
            ReactDOM.createRoot(rootElement).render(React.createElement(TargetComponent));
          }
        } catch (err) {
          console.error(err);
          document.getElementById('root').innerHTML = '<div style="color: #f87171; padding: 20px; font-family: monospace;">Runtime Error: ' + err.message + '</div>';
        }
      </script>
    `;

    // If there is custom index.html content
    if (indexHtmlFile && indexHtmlFile.content.trim().length > 0) {
      let html = indexHtmlFile.content;

      // Inject React header if missing
      if (!html.includes("react.development.js")) {
        html = html.replace("<head>", `<head>\n${reactHeader}`);
      } else {
        html = html.replace("<head>", `<head>\n${modulePolyfill}`);
      }

      // Inject combined CSS
      if (combinedCss.trim().length > 0) {
        html = html.replace(
          "</head>",
          `  <style>\n${combinedCss}\n</style>\n</head>`
        );
      }

      // Append component scripts, main script, and mount script before </body>
      const allScripts = `${componentScriptsHtml}\n${mainScriptHtml}\n${mountRenderScript}`;
      html = html.replace("</body>", `${allScripts}\n</body>`);

      return html;
    }

    // Default Fallback Template with Tailwind, React & Babel support
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
  <div id="root">
    ${
      !mainJsFile
        ? `<div class="flex items-center justify-center min-h-screen text-slate-400 font-sans">
            <p>No previewable index.html or App component found.</p>
          </div>`
        : ""
    }
  </div>

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
          sandbox="allow-scripts allow-modals"
          className={`bg-slate-900 transition-all duration-300 ${getViewportDimensions()}`}
        />
      </div>
    </div>
  );
};
