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

// Module-level cache to prevent re-transpiling unchanged files with Babel on every render
const transpileCache = new Map<string, string>();

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ files, previewUrl, isProcessing, theme = "dark" }) => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [srcDoc, setSrcDoc] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isLight = theme === "light";

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
        (f) =>
          (f.path.endsWith(".tsx") ||
            f.path.endsWith(".jsx") ||
            f.path.endsWith(".js") ||
            f.path.endsWith(".ts")) &&
          !isAppFile(f) &&
          !f.path.endsWith(".d.ts")
      );

      const consoleSilenceScript = `
        <script>
          (function() {
            var isSilenced = function(args) {
              var str = '';
              for (var i = 0; i < args.length; i++) {
                var a = args[i];
                str += (typeof a === 'string' ? a : (a && a.message ? a.message : '')) + ' ';
              }
              return str.includes('cdn.tailwindcss.com') ||
                     str.includes('should not be used in production') ||
                     str.includes('Each child in a list should have a unique "key" prop') ||
                     str.includes('unique "key" prop') ||
                     str.includes('reactjs.org/link/warning-keys');
            };

            var origWarn = console.warn;
            console.warn = function() {
              if (isSilenced(arguments)) return;
              origWarn.apply(console, arguments);
            };

            var origError = console.error;
            console.error = function() {
              if (isSilenced(arguments)) return;
              origError.apply(console, arguments);
            };
          })();
        </script>
      `;

      const modulePolyfill = `
        <script>
          window.exports = window.exports || {};
          window.module = window.module || { exports: window.exports };
          window.componentRegistry = window.componentRegistry || {};
          window.__fileErrors = [];

          function unwrapComponent(type, depth) {
            if ((depth || 0) > 4) return type;
            if (!type) {
              return function MissingFallback(props) {
                return (props && props.children) ? (window.React ? window.React.createElement(window.React.Fragment || 'div', null, props.children) : null) : null;
              };
            }
            if (typeof type === 'function' || typeof type === 'string') return type;
            if (typeof type === 'object') {
              if (type.$$typeof) return type;
              if (typeof type.default === 'function') return type.default;
              if (typeof type.default === 'object' && type.default) return unwrapComponent(type.default, (depth || 0) + 1);
              if (typeof type.App === 'function') return type.App;
              var vals = Object.values(type);
              for (var i = 0; i < vals.length; i++) {
                if (typeof vals[i] === 'function') return vals[i];
              }
            }
            return type;
          }

          if (window.React && !window.__origCreateElement) {
            window.__origCreateElement = window.React.createElement;
            window.React.createElement = function(type) {
              var args = Array.prototype.slice.call(arguments);
              args[0] = unwrapComponent(type, 0);
              return window.__origCreateElement.apply(this, args);
            };
          }

          window.__makeCallableModule = function(target, primary) {
            target.__esModule = true;
            var base = typeof primary === 'function' ? primary : function(props) {
              return (props && props.children) || null;
            };
            var fn = function(props) {
              return base(props);
            };
            Object.assign(fn, target);
            if (primary) fn.default = primary;
            fn.__esModule = true;

            if (typeof Proxy !== 'undefined') {
              return new Proxy(fn, {
                get: function(t, p) {
                  if (p in t) return t[p];
                  if (typeof p === 'string') {
                    var lower = p.toLowerCase();
                    var match = Object.keys(t).find(function(k) { return k.toLowerCase() === lower; });
                    if (match) return t[match];
                  }
                  if (p === 'default') return t.default || t;
                  return t[p];
                }
              });
            }
            return fn;
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
            if (moduleName === 'react-router-dom' || moduleName === 'react-router') {
              var RouterShim = function(props) { return (props && props.children) ? (window.React ? window.React.createElement(window.React.Fragment || 'div', null, props.children) : null) : null; };
              var LinkShim = function(props) {
                return window.React ? window.React.createElement('a', {
                  href: (props && props.to) || '#',
                  className: (props && props.className) || '',
                  onClick: function(e) { e.preventDefault(); if (props && props.onClick) props.onClick(e); }
                }, props && props.children) : null;
              };
              return {
                BrowserRouter: RouterShim,
                HashRouter: RouterShim,
                MemoryRouter: RouterShim,
                Router: RouterShim,
                Routes: RouterShim,
                Route: function(props) {
                  if (!props) return null;
                  return props.element || (props.Component ? (window.React ? window.React.createElement(props.Component) : null) : null);
                },
                Link: LinkShim,
                NavLink: LinkShim,
                useNavigate: function() { return function() {}; },
                useLocation: function() { return { pathname: '/', search: '', hash: '', state: null }; },
                useParams: function() { return {}; },
                useSearchParams: function() { return [new URLSearchParams(), function() {}]; },
                Outlet: function() { return null; },
                default: RouterShim
              };
            }
            if (moduleName === 'framer-motion') {
              var createMotion = function(tag) {
                return function(props) {
                  var p = Object.assign({}, props);
                  delete p.initial; delete p.animate; delete p.exit; delete p.transition;
                  delete p.whileHover; delete p.whileTap; delete p.whileInView; delete p.viewport;
                  return window.React ? window.React.createElement(tag, p) : null;
                };
              };
              var motionProxy = typeof Proxy !== 'undefined' ? new Proxy({}, {
                get: function(t, tag) { return createMotion(tag); }
              }) : {};
              return {
                motion: motionProxy,
                AnimatePresence: function(props) { return props && props.children; },
                useAnimation: function() { return { start: function() {} }; },
                default: motionProxy
              };
            }
            if (moduleName === 'clsx' || moduleName === 'classnames' || moduleName === 'tailwind-merge') {
              var cn = function() {
                var args = Array.prototype.slice.call(arguments);
                return args.flat ? args.flat(Infinity).filter(Boolean).join(' ') : args.filter(Boolean).join(' ');
              };
              return { default: cn, clsx: cn, twMerge: cn };
            }
            if (moduleName === 'lucide-react') {
              var L = window.lucide || {};
              var iconSvgDefs = {
                Sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
                Rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 9v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
                CheckCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
                ArrowRight: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
                ArrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
                ArrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
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
                Terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
                ExternalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
                Github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
                Linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
                Twitter: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
                Briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
                GraduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
                Award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
                Folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
                FolderGit2: '<path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2"/><circle cx="13" cy="12" r="2"/><path d="M18 19c-2.8 0-5-2.2-5-5v8"/><circle cx="18" cy="19" r="2"/>',
                Layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
                Send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
                Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
                Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
                FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
                MapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
                Phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
                Calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
                Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
                Server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
                Database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
                Smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
                Laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
                Filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
                Layout: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
                Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
                Moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
                ChevronLeft: '<path d="m15 18-6-6 6-6"/>',
                ChevronUp: '<path d="m18 15-6-6-6 6"/>',
                Plus: '<path d="M5 12h14m-7-7v14"/>',
                Trash2: '<path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>',
                User: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
                Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
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
            
            if (moduleName === 'gsap' || moduleName === 'gsap/all') {
              var G = window.gsap || {};
              var ST = window.ScrollTrigger || (window.gsap && window.gsap.ScrollTrigger) || {};
              return Object.assign({ default: G, gsap: G, ScrollTrigger: ST }, G);
            }
            if (moduleName === 'gsap/ScrollTrigger' || moduleName === 'gsap/dist/ScrollTrigger') {
              var ST = window.ScrollTrigger || (window.gsap && window.gsap.ScrollTrigger) || {};
              return Object.assign({ default: ST, ScrollTrigger: ST }, ST);
            }

            if (window.componentRegistry[moduleName]) return window.componentRegistry[moduleName];

            var clean = moduleName.replace(/^[\\.\\/]+/, '').replace(/^src\\//, '').replace(/\\.[^/.]+$/, '');
            if (window.componentRegistry[clean]) return window.componentRegistry[clean];
            if (window.componentRegistry["./" + clean]) return window.componentRegistry["./" + clean];
            if (window.componentRegistry["../" + clean]) return window.componentRegistry["../" + clean];
            if (window.componentRegistry[clean.toLowerCase()]) return window.componentRegistry[clean.toLowerCase()];

            var base = clean.split('/').pop();
            if (base && window.componentRegistry[base]) return window.componentRegistry[base];
            if (base && window.componentRegistry[base.toLowerCase()]) return window.componentRegistry[base.toLowerCase()];

            var createSafeDummy = function() {
              var dummyFn = function(props) { return (props && props.children) ? (window.React ? window.React.createElement(window.React.Fragment || 'div', null, props.children) : null) : null; };
              dummyFn.__esModule = true;
              dummyFn.default = dummyFn;
              if (typeof Proxy !== 'undefined') {
                return new Proxy(dummyFn, {
                  get: function(t, p) {
                    if (p === '__esModule') return true;
                    if (p === 'default') return dummyFn;
                    if (p === 'length') return 0;
                    if (p === Symbol.iterator) return function() { return [][Symbol.iterator](); };
                    if (p === '0' || p === 0) return {};
                    if (p === 'toString' || p === 'valueOf') return function() { return ''; };
                    return createSafeDummy();
                  }
                });
              }
              return dummyFn;
            };

            return createSafeDummy();
          };
        </script>
      `;

      const zeroOverflowResetCss = `
        <style id="preview-viewport-resets">
          *, *::before, *::after {
            box-sizing: border-box !important;
          }
          html {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            scroll-behavior: smooth;
          }
          body {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative !important;
          }
          #root {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            min-height: 100vh !important;
          }
          /* Neutralize Tailwind w-screen 100vw scrollbar bug */
          .w-screen {
            width: 100% !important;
            max-width: 100% !important;
          }
          .min-w-screen {
            min-width: 100% !important;
            max-width: 100% !important;
          }
          /* Media boundary containment */
          img, video, canvas, svg {
            max-width: 100%;
          }
        </style>
      `;

      const reactHeader = `
        ${consoleSilenceScript}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                width: {
                  screen: '100%',
                },
                maxWidth: {
                  screen: '100%',
                },
                fontFamily: {
                  sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                  display: ['"Space Grotesk"', 'sans-serif'],
                  mono: ['"JetBrains Mono"', 'monospace'],
                }
              }
            }
          };
        </script>
        ${zeroOverflowResetCss}
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
        ${modulePolyfill}
      `;

      const transpileFile = (file: ProjectFile) => {
        const cacheKey = `${file.path}:::${file.content}`;
        if (transpileCache.has(cacheKey)) {
          return transpileCache.get(cacheKey)!;
        }

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

          const scriptTag = `
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

                  if (!combined.default) {
                    if (primary) {
                      combined.default = primary;
                    } else {
                      var expKeys = Object.keys(combined).filter(function(k) { return k !== '__esModule' && k !== 'default'; });
                      if (expKeys.length > 0) {
                        var firstExp = expKeys.find(function(k) { return Array.isArray(combined[k]); }) || expKeys[0];
                        combined.default = combined[firstExp];
                      }
                    }
                  }

                  var exportedModule = window.__makeCallableModule ? window.__makeCallableModule(combined, primary || combined.default) : combined;

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

          transpileCache.set(cacheKey, scriptTag);
          return scriptTag;
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
              var err = e.error || {};
              var msg = e.message || String(e);
              var stack = err.stack || '';
              var fileInfo = 'Line: ' + (e.lineno || 'N/A') + ' | File: ' + (e.filename || 'App');
              if (stack) {
                var lines = stack.split('\\n');
                for (var i = 1; i < lines.length; i++) {
                  if (!lines[i].includes('react-dom') && !lines[i].includes('react.development')) {
                    fileInfo = lines[i].trim();
                    break;
                  }
                }
              }
              rootElement.innerHTML = '<div style="background-color: #0f172a; color: #f87171; padding: 24px; font-family: monospace; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;"><h3 style="font-size: 16px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">⚠️ Preview Runtime Exception</h3><p style="margin-bottom: 12px; white-space: pre-wrap; font-weight: 600;">' + msg + '</p><div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">' + fileInfo + '</div>' + (stack ? '<details><summary style="cursor:pointer; color:#94a3b8; font-size:11px;">View Stack Trace</summary><pre style="font-size:11px; color:#64748b; margin-top:8px; overflow-x:auto;">' + stack + '</pre></details>' : '') + '</div>';
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
                  class PreviewErrorBoundary extends window.React.Component {
                    constructor(props) {
                      super(props);
                      this.state = { hasError: false, error: null, errorInfo: null };
                    }
                    static getDerivedStateFromError(error) {
                      return { hasError: true, error: error };
                    }
                    componentDidCatch(error, errorInfo) {
                      console.error("Preview render error:", error, errorInfo);
                      this.setState({ error: error, errorInfo: errorInfo });
                    }
                    render() {
                      if (this.state.hasError) {
                        var err = this.state.error || {};
                        var info = this.state.errorInfo || {};
                        var compStack = (info.componentStack || "").trim();
                        var jsStack = (err.stack || "").trim();
                        return window.React.createElement("div", {
                          style: {
                            backgroundColor: "#0f172a",
                            color: "#f87171",
                            padding: "24px",
                            fontFamily: "monospace",
                            border: "1px solid #dc2626",
                            borderRadius: "12px",
                            margin: "20px",
                            maxWidth: "900px"
                          }
                        },
                          window.React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" } },
                            window.React.createElement("span", { style: { fontSize: "20px" } }, "⚠️"),
                            window.React.createElement("h3", { style: { fontSize: "16px", fontWeight: "bold", color: "#fbbf24", margin: 0 } }, "Component Render Exception")
                          ),
                          window.React.createElement("p", { style: { fontSize: "14px", color: "#fca5a5", marginBottom: "16px", fontWeight: "600", whiteSpace: "pre-wrap" } },
                            err.message || String(err)
                          ),
                          compStack ? window.React.createElement("div", { style: { marginBottom: "16px" } },
                            window.React.createElement("div", { style: { fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#94a3b8", marginBottom: "6px" } }, "Component Hierarchy:"),
                            window.React.createElement("pre", { style: { fontSize: "12px", background: "#1e293b", padding: "12px", borderRadius: "8px", color: "#38bdf8", overflowX: "auto", margin: 0, whiteSpace: "pre-wrap" } }, compStack)
                          ) : null,
                          jsStack ? window.React.createElement("details", { style: { marginTop: "12px" } },
                            window.React.createElement("summary", { style: { fontSize: "12px", color: "#94a3b8", cursor: "pointer" } }, "Technical Stack Trace"),
                            window.React.createElement("pre", { style: { fontSize: "11px", background: "#020617", padding: "12px", borderRadius: "8px", color: "#64748b", overflowX: "auto", marginTop: "8px", whiteSpace: "pre-wrap" } }, jsStack)
                          ) : null
                        );
                      }
                      return this.props.children;
                    }
                  }

                  const rootElement = document.getElementById('root') || document.body;
                  const unwrapped = unwrapComponent(TargetComponent);
                  ReactDOM.createRoot(rootElement).render(
                    window.React.createElement(PreviewErrorBoundary, null,
                      window.React.createElement(unwrapped)
                    )
                  );
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

        // Ensure html and body have overflow-x-hidden and w-full max-w-full
        if (!html.includes("overflow-x-hidden")) {
          html = html.replace(/<html(?![^>]*overflow-x-hidden)/i, '<html class="overflow-x-hidden scroll-smooth"');
          html = html.replace(/<body(?![^>]*overflow-x-hidden)/i, '<body class="overflow-x-hidden w-full max-w-full"');
        }

        const headMatch = html.match(/<head[^>]*>/i);
        const scriptsToInject = `${componentScriptsHtml}\n${mainScriptHtml}\n${mountRenderScript}`;
        const styleTag = combinedCss.trim().length > 0 ? `  <style>\n${combinedCss}\n</style>\n` : "";

        if (headMatch) {
          const gsapScript = !html.includes("gsap.min.js")
            ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>\n'
            : '';
          const headerToInject = !html.includes("react.development.js")
            ? reactHeader
            : `${consoleSilenceScript}\n${zeroOverflowResetCss}\n${gsapScript}${modulePolyfill}`;
          html = html.replace(headMatch[0], `${headMatch[0]}\n${headerToInject}\n${styleTag}`);
        } else {
          html = `<head>\n${reactHeader}\n${styleTag}</head>\n${html}`;
        }

        const bodyCloseMatch = html.match(/<\/body>/i);
        if (bodyCloseMatch) {
          html = html.replace(bodyCloseMatch[0], `${scriptsToInject}\n${bodyCloseMatch[0]}`);
        } else {
          html = `${html}\n${scriptsToInject}`;
        }

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

  // Debounce HTML generation so rapid file updates don't repeatedly lock the main thread with Babel
  useEffect(() => {
    const timer = setTimeout(() => {
      const doc = generateSrcDoc();
      setSrcDoc(doc);
    }, 150);

    return () => clearTimeout(timer);
  }, [files]);

  const handleRefresh = () => {
    transpileCache.clear();
    setSrcDoc(generateSrcDoc());
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

  const getViewportStyle = (): React.CSSProperties => {
    if (viewportMode === "desktop") {
      return {
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        transform: "none",
      };
    }
    if (viewportMode === "tablet") {
      return {
        width: "768px",
        maxWidth: "100%",
        height: "90%",
      };
    }
    // mobile
    return {
      width: "375px",
      maxWidth: "100%",
      height: "667px",
      maxHeight: "95%",
    };
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
            title="Desktop Mode"
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
      <div
        className={`flex-1 flex flex-col items-center justify-center overflow-hidden relative transition-colors ${
          viewportMode === "desktop" ? "p-0" : "p-3"
        } ${isLight ? "bg-slate-200" : "bg-slate-950"}`}
      >
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
          srcDoc={srcDoc || generateSrcDoc()}
          title="App Live Preview"
          sandbox="allow-scripts allow-modals"
          style={getViewportStyle()}
          className={`bg-slate-900 transition-all duration-300 border-0 ${
            viewportMode !== "desktop"
              ? isLight
                ? "border-4 border-slate-300 shadow-2xl rounded-2xl"
                : "border-4 border-slate-800 shadow-2xl rounded-2xl"
              : ""
          }`}
        />
      </div>
    </div>
  );
};
