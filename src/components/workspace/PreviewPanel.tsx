import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Sparkles } from "lucide-react";
import * as Babel from "@babel/standalone";

interface ProjectFile {
  path: string;
  content: string;
}

interface PreviewPanelProps {
  files: ProjectFile[];
  activeFilePath?: string | null;
  previewUrl?: string | null;
  isProcessing?: boolean;
  theme?: "dark" | "light";
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ files, previewUrl, isProcessing, theme = "dark" }) => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isLight = theme === "light";

  // Auto-refresh iframe when project files change
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [files]);

  // Generate self-contained sandboxed HTML doc with Babel Standalone & React UMD
  const generateSrcDoc = (): string => {
    try {
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
          window.__fileErrors = [];

          var origWarn = console.warn;
          console.warn = function() {
            var msg = arguments[0] || '';
            if (typeof msg === 'string' && msg.includes('cdn.tailwindcss.com should not be used in production')) return;
            origWarn.apply(console, arguments);
          };
          
          window.require = function(moduleName) {
            if (moduleName === 'react' || moduleName === 'react/jsx-runtime' || moduleName === 'react/jsx-dev-runtime') {
              var R = window.React || {};
              return Object.assign({ default: R, jsx: R.createElement, jsxs: R.createElement, Fragment: R.Fragment || 'div' }, R);
            }
            if (moduleName === 'react-dom' || moduleName === 'react-dom/client') {
              var RD = window.ReactDOM || {};
              return Object.assign({ default: RD }, RD);
            }
            if (moduleName === 'lucide-react') {
              var L = window.lucide || {};
              if (typeof Proxy !== 'undefined') {
                return new Proxy(L, {
                  get: function(target, prop) {
                    if (prop in target) return target[prop];
                    if (prop === 'default' || prop === '__esModule') return target;
                    return function DummyIcon(props) {
                      var p = props || {};
                      return window.React ? window.React.createElement('svg', {
                        width: p.size || p.width || 18,
                        height: p.size || p.height || 18,
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: '2',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        className: p.className || ''
                      }, window.React.createElement('circle', { cx: 12, cy: 12, r: 9 })) : null;
                    };
                  }
                });
              }
              return L;
            }
            
            if (window.componentRegistry[moduleName]) return window.componentRegistry[moduleName];

            var clean = moduleName.replace(/^[\\.\\/]+/, '').replace(/^src\\//, '').replace(/\\.[^/.]+$/, '');
            if (window.componentRegistry[clean]) return window.componentRegistry[clean];
            if (window.componentRegistry["./" + clean]) return window.componentRegistry["./" + clean];
            if (window.componentRegistry["../" + clean]) return window.componentRegistry["../" + clean];

            var base = clean.split('/').pop();
            if (base && window.componentRegistry[base]) return window.componentRegistry[base];
            if (base && window.componentRegistry[base.toLowerCase()]) return window.componentRegistry[base.toLowerCase()];

            return window.exports;
          };
        </script>
      `;

      const reactHeader = `
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
        ${modulePolyfill}
      `;

      const transpileFile = (file: ProjectFile) => {
        try {
          const result = Babel.transform(file.content, {
            presets: ["react", "typescript"],
            plugins: ["transform-modules-commonjs"],
            filename: file.path,
          });
          const jsCode = result && result.code ? result.code : "";
          const isMainApp =
            file.path.endsWith("App.tsx") ||
            file.path.endsWith("App.jsx") ||
            file.path.endsWith("App.js") ||
            file.path.endsWith("main.tsx") ||
            file.path.endsWith("index.tsx") ||
            file.path === "App" ||
            file.path === "./App";

          return `
            <script>
              (function() {
                var fileExports = {};
                var module = { exports: fileExports };
                try {
                  var exports = fileExports;
                  ${jsCode}

                  var combined = Object.assign({}, fileExports, module.exports);
                  var primary = combined.default || combined.App;

                  if (!primary) {
                    var keys = Object.keys(combined);
                    for (var i = 0; i < keys.length; i++) {
                      var val = combined[keys[i]];
                      if (typeof val === 'function' || (typeof val === 'object' && val !== null)) {
                        primary = val;
                        break;
                      }
                    }
                  }

                  if (primary && !combined.default) {
                    combined.default = primary;
                  }

                  var rawPath = "${file.path}";
                  var noExt = rawPath.replace(/\\.[^/.]+$/, "");
                  var clean = noExt.replace(/^[\\.\\/]+/, '').replace(/^src\\//, '');
                  var base = clean.split('/').pop();

                  var keysToRegister = [
                    rawPath,
                    noExt,
                    "./" + noExt,
                    "../" + noExt,
                    clean,
                    "./" + clean,
                    "../" + clean,
                    base,
                    "./" + base,
                    "../" + base,
                    clean.toLowerCase(),
                    base.toLowerCase()
                  ];

                  keysToRegister.forEach(function(k) {
                    if (k) {
                      window.componentRegistry[k] = combined;
                    }
                  });

                  var isApp = ${isMainApp} || clean.toLowerCase() === 'app' || base.toLowerCase() === 'app';
                  if (isApp && primary) {
                    window.MainAppComponent = primary;
                    window.exports.default = primary;
                    window.exports.App = primary;
                  } else if (!window.MainAppComponent && primary && (clean.toLowerCase().includes('app') || base.toLowerCase().includes('app'))) {
                    window.MainAppComponent = primary;
                  }
                } catch (err) {
                  console.error("Evaluation error in " + "${file.path}" + ":", err);
                  window.__fileErrors = window.__fileErrors || [];
                  window.__fileErrors.push({ path: "${file.path}", error: err.message });
                }
              })();
            </script>
          `;
        } catch (babelErr: any) {
          console.error("Babel transpilation error in " + file.path, babelErr);
          return `
            <script>
              window.addEventListener('DOMContentLoaded', function() {
                var root = document.getElementById('root') || document.body;
                if (root) {
                  root.innerHTML = '<div style="background-color: #0f172a; color: #f87171; padding: 24px; font-family: monospace; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;"><h3 style="font-size: 16px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">⚠️ Syntax / Compilation Error in ${file.path}</h3><p style="margin-bottom: 12px; white-space: pre-wrap;">${babelErr.message.replace(/'/g, "\\'")}</p></div>';
                }
              });
            </script>
          `;
        }
      };

      const componentScriptsHtml = componentFiles.map(transpileFile).join("\n");
      const mainScriptHtml = mainJsFile ? transpileFile(mainJsFile) : "";

      const mountRenderScript = `
        <script>
          window.addEventListener('error', function(e) {
            var rootElement = document.getElementById('root') || document.body;
            if (rootElement && !rootElement.innerHTML.includes('Preview Runtime Exception')) {
              rootElement.innerHTML = '<div style="background-color: #0f172a; color: #f87171; padding: 24px; font-family: monospace; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;"><h3 style="font-size: 16px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">⚠️ Preview Runtime Exception</h3><p style="margin-bottom: 12px; white-space: pre-wrap;">' + (e.message || e) + '</p><div style="font-size: 12px; color: #94a3b8;">Line: ' + (e.lineno || 'N/A') + ' | File: ' + (e.filename || 'App') + '</div></div>';
            }
          });

          window.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              try {
                if (window.__fileErrors && window.__fileErrors.length > 0) {
                  var errMsgs = window.__fileErrors.map(function(e) { return '• ' + e.path + ': ' + e.error; }).join('<br/>');
                  document.getElementById('root').innerHTML = '<div style="background-color: #0f172a; color: #f87171; padding: 24px; font-family: monospace; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;"><h3 style="font-size: 16px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">⚠️ File Compilation / Execution Error</h3><div style="margin-bottom: 12px; white-space: pre-wrap;">' + errMsgs + '</div></div>';
                  return;
                }

                let TargetComponent = window.MainAppComponent;
                
                if (!TargetComponent) {
                  const regKeys = Object.keys(window.componentRegistry);
                  for (var i = 0; i < regKeys.length; i++) {
                    var k = regKeys[i];
                    if (k.toLowerCase().includes("app")) {
                      var mod = window.componentRegistry[k];
                      TargetComponent = mod.default || mod.App || Object.values(mod)[0];
                      if (TargetComponent) break;
                    }
                  }
                }

                if (!TargetComponent && window.exports) {
                  TargetComponent = window.exports.default || window.exports.App;
                }

                if (!TargetComponent) {
                  const regKeys = Object.keys(window.componentRegistry);
                  if (regKeys.length > 0) {
                    var firstMod = window.componentRegistry[regKeys[0]];
                    TargetComponent = firstMod.default || firstMod.App || Object.values(firstMod)[0];
                  }
                }

                if (TargetComponent && (typeof TargetComponent === 'function' || typeof TargetComponent === 'object')) {
                  const rootElement = document.getElementById('root') || document.body;
                  ReactDOM.createRoot(rootElement).render(React.createElement(TargetComponent));
                }
              } catch (err) {
                console.error(err);
                document.getElementById('root').innerHTML = '<div style="background-color: #0f172a; color: #f87171; padding: 24px; font-family: monospace; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;"><h3 style="font-size: 16px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">⚠️ Render Error</h3><p>' + err.message + '</p></div>';
              }
            }, 50);
          });
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
    body { background-color: #0f172a; color: #f87171; margin: 0; padding: 0; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
  <div id="root"></div>
  ${componentScriptsHtml}
  ${mainScriptHtml}
  ${mountRenderScript}
</body>
</html>`;
    } catch (globalErr: any) {
      return `<!DOCTYPE html><html><body style="background:#0f172a; color:#f87171; padding:20px; font-family:sans-serif;"><h3>Preview Compilation Error</h3><p>${globalErr.message}</p></body></html>`;
    }
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
        return `w-[375px] h-[667px] shadow-2xl rounded-2xl border-4 ${
          isLight ? "border-slate-300" : "border-slate-800"
        }`;
      case "tablet":
        return `w-[768px] h-[90%] shadow-2xl rounded-xl border-4 ${
          isLight ? "border-slate-300" : "border-slate-800"
        }`;
      case "desktop":
      default:
        return "w-full h-full";
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden border-l transition-colors ${
        isLight ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-200"
      }`}
    >
      {/* Preview Header Toolbar */}
      <div
        className={`h-10 border-b px-3 flex items-center justify-between select-none ${
          isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/80"
        }`}
      >
        <div className="flex items-center space-x-1">
          <span className={`text-xs font-semibold uppercase tracking-wider px-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            Live Preview
          </span>
          <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-mono">
            Live Sandboxed Engine
          </span>
        </div>

        {/* Viewport Modes */}
        <div className={`flex items-center space-x-1 p-1 rounded-lg border ${isLight ? "bg-slate-100 border-slate-300" : "bg-slate-950 border-slate-800"}`}>
          <button
            onClick={() => setViewportMode("desktop")}
            className={`p-1.5 rounded text-xs flex items-center space-x-1 transition-colors ${
              viewportMode === "desktop"
                ? "bg-indigo-600 text-white font-medium"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
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
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
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
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
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
            className={`p-1.5 rounded transition-colors ${
              isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Refresh Sandbox Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className={`p-1.5 rounded transition-colors ${
              isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sandbox IFrame Container */}
      <div className={`flex-1 flex items-center justify-center p-2 overflow-auto relative ${isLight ? "bg-slate-200" : "bg-slate-950"}`}>
        {/* Animated Loading Overlay: ONLY shown when AI Agent is actively generating code */}
        {isProcessing && (
          <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200 backdrop-blur-md ${isLight ? "bg-white/90 text-slate-900" : "bg-slate-950/90 text-white"}`}>
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>⚡ AI Agent is Building Application</h3>
            <p className={`text-sm max-w-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>Generating components, styling layouts, and compiling live preview...</p>
          </div>
        )}

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
