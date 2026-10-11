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
            if (typeof msg === 'string' && (
              msg.includes('cdn.tailwindcss.com should not be used in production') ||
              msg.includes('Each child in a list should have a unique "key" prop')
            )) return;
            origWarn.apply(console, arguments);
          };

          function unwrapComponent(type) {
            if (!type) return type;
            if (typeof type === 'function' || typeof type === 'string') return type;
            if (typeof type === 'object') {
              if (typeof type.default === 'function') return unwrapComponent(type.default);
              if (typeof type.App === 'function') return unwrapComponent(type.App);
              var vals = Object.values(type);
              for (var i = 0; i < vals.length; i++) {
                if (typeof vals[i] === 'function') return unwrapComponent(vals[i]);
              }
            }
            return type;
          }

          if (window.React) {
            var origCE = window.React.createElement;
            window.React.createElement = function(type) {
              arguments[0] = unwrapComponent(type);
              return origCE.apply(this, arguments);
            };
          }

          window.__makeCallableModule = function(target, primary) {
            target.__esModule = true;
            if (typeof primary === 'function') {
              var fn = function(props) {
                return primary(props);
              };
              Object.assign(fn, target);
              fn.default = primary;
              fn.__esModule = true;
              return fn;
            }
            return target;
          };
          
          window.require = function(moduleName) {
            if (moduleName === 'react' || moduleName === 'react/jsx-runtime' || moduleName === 'react/jsx-dev-runtime') {
              var R = window.React || {};
              var safeJsx = function(type, props, key) {
                var resolved = unwrapComponent(type);
                var safeProps = props || {};
                if (key !== undefined && safeProps.key === undefined) {
                  safeProps = Object.assign({}, safeProps, { key: key });
                }
                return R.createElement(resolved, safeProps);
              };
              return Object.assign({
                default: R,
                jsx: safeJsx,
                jsxs: safeJsx,
                jsxDEV: safeJsx,
                Fragment: R.Fragment || 'div'
              }, R);
            }
            if (moduleName === 'react-dom' || moduleName === 'react-dom/client') {
              var RD = window.ReactDOM || {};
              return Object.assign({ default: RD }, RD);
            }
            if (moduleName === 'lucide-react') {
              var L = window.lucide || {};
              var iconSvgDefs = {
                Sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
                ArrowRight: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
                CheckCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
                Check: '<polyline points="20 6 9 17 4 12"/>',
                Menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
                X: '<path d="M18 6 6 18M6 6l12 12"/>',
                Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
                Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
                Globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
                Cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2m-6-2v2M15 20v2m-6-2v2M2 15h2m-2-6h2M20 15h2m-2-6h2"/>',
                Code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
                Code2: '<path d="m18 16 4-4-4-4M6 8l-4 4 4 4m8.5-12-5 16"/>',
                Plus: '<path d="M5 12h14m-7-7v14"/>',
                Trash2: '<path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>',
                User: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
                Search: '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>',
                Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
                Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
                Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
                ChevronRight: '<path d="m9 18 6-6-6-6"/>',
                ChevronDown: '<path d="m6 9 6 6 6-6"/>',
                Play: '<polygon points="6 3 20 12 6 21 6 3"/>'
              };
              var createDummyIcon = function(name) {
                return function DummyIcon(props) {
                  var p = props || {};
                  var sz = p.size || p.width || p.height || 18;
                  if (!window.React) return null;
                  var def = iconSvgDefs[name];
                  if (def) {
                    return window.React.createElement('svg', {
                      width: sz,
                      height: sz,
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      stroke: 'currentColor',
                      strokeWidth: '2',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      className: p.className || '',
                      dangerouslySetInnerHTML: { __html: def }
                    });
                  }
                  return window.React.createElement('svg', {
                    width: sz,
                    height: sz,
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: '2',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    className: p.className || ''
                  }, window.React.createElement('circle', { cx: 12, cy: 12, r: 8 }));
                };
              };

              if (typeof Proxy !== 'undefined') {
                return new Proxy(L, {
                  get: function(target, prop) {
                    if (prop === '__esModule') return true;
                    if (prop === 'default') return target;
                    if (prop in target) return target[prop];
                    return createDummyIcon(prop);
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
                  combined.__esModule = true;
                  var primary = combined.default || combined.App;

                  if (!primary) {
                    var keys = Object.keys(combined);
                    for (var i = 0; i < keys.length; i++) {
                      var val = combined[keys[i]];
                      if (typeof val === 'function') {
                        primary = val;
                        break;
                      }
                    }
                  }

                  if (primary && !combined.default) {
                    combined.default = primary;
                  }

                  var exportedModule = window.__makeCallableModule ? window.__makeCallableModule(combined, primary) : combined;

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
                      window.componentRegistry[k] = exportedModule;
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
    body { background-color: #0f172a; color: #f8fafc; margin: 0; padding: 0; }
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
