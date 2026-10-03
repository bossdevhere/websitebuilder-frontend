import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Code, Play } from "lucide-react";

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

    // Look for App / component files
    const mainJsFile = files.find(
      (f) =>
        f.path.endsWith("App.tsx") ||
        f.path.endsWith("App.jsx") ||
        f.path.endsWith("App.js") ||
        f.path.endsWith("main.tsx") ||
        f.path.endsWith("index.tsx") ||
        f.path.endsWith("index.js")
    );

    // If there is custom index.html content
    if (indexHtmlFile && indexHtmlFile.content.trim().length > 0) {
      let html = indexHtmlFile.content;

      // Inject Tailwind CDN if missing
      if (!html.includes("cdn.tailwindcss.com")) {
        html = html.replace(
          "<head>",
          `<head>\n  <script src="https://cdn.tailwindcss.com"></script>`
        );
      }

      // Inject combined CSS
      if (combinedCss.trim().length > 0) {
        html = html.replace(
          "</head>",
          `  <style>\n${combinedCss}\n</style>\n</head>`
        );
      }

      // Inject React / Babel if main JS file contains JSX/TSX
      if (mainJsFile && (mainJsFile.path.endsWith(".tsx") || mainJsFile.path.endsWith(".jsx"))) {
        const reactHeader = `
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        `;
        html = html.replace("<head>", `<head>${reactHeader}`);

        // Append main component render script before </body>
        const babelScript = `
  <script type="text/babel">
    ${mainJsFile.content}
    if (typeof App !== 'undefined') {
      const rootElement = document.getElementById('root') || document.body;
      ReactDOM.createRoot(rootElement).render(<App />);
    }
  </script>
        `;
        html = html.replace("</body>", `${babelScript}\n</body>`);
      }

      return html;
    }

    // Default Fallback Template with Tailwind, React & Babel support
    const rawJsContent = mainJsFile ? mainJsFile.content : "";
    const isReact = mainJsFile && (mainJsFile.path.endsWith(".tsx") || mainJsFile.path.endsWith(".jsx"));

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${
    isReact
      ? `<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`
      : ""
  }
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

  ${
    mainJsFile
      ? isReact
        ? `<script type="text/babel">
    try {
      ${rawJsContent}
      if (typeof App !== 'undefined') {
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
      }
    } catch (err) {
      console.error(err);
      document.getElementById('root').innerHTML = '<div style="color: #f87171; padding: 20px; font-family: monospace;">Runtime Error: ' + err.message + '</div>';
    }
  </script>`
        : `<script>
    try {
      ${rawJsContent}
    } catch (err) {
      console.error(err);
    }
  </script>`
      : ""
  }
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
          sandbox="allow-scripts allow-modals allow-same-origin"
          className={`bg-slate-900 transition-all duration-300 ${getViewportDimensions()}`}
        />
      </div>
    </div>
  );
};
