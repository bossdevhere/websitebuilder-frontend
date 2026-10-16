import JSZip from "jszip";
import { Project } from "../types";

export async function downloadProjectZip(project: Project): Promise<void> {
  const zip = new JSZip();
  const files = project.files || [];

  // Add all project files
  files.forEach((file) => {
    const cleanPath = file.path.replace(/^\/+/, "");
    zip.file(cleanPath, file.content || "");
  });

  // Provide default package.json if not present
  if (!files.some((f) => f.path === "package.json" || f.path === "/package.json")) {
    const safeProjectName = (project.name || "ai-app").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    zip.file(
      "package.json",
      JSON.stringify(
        {
          name: safeProjectName,
          private: true,
          version: "0.1.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            "lucide-react": "^0.475.0",
          },
          devDependencies: {
            "@types/react": "^18.3.18",
            "@types/react-dom": "^18.3.5",
            "@vitejs/plugin-react": "^4.3.4",
            autoprefixer: "^10.4.20",
            postcss: "^8.5.1",
            tailwindcss: "^3.4.17",
            vite: "^6.1.0",
          },
        },
        null,
        2
      )
    );
  }

  // Provide default vite.config.ts if missing
  if (!files.some((f) => f.path.includes("vite.config"))) {
    zip.file(
      "vite.config.ts",
      `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`
    );
  }

  // Provide default tailwind.config.js if missing
  if (!files.some((f) => f.path.includes("tailwind.config"))) {
    zip.file(
      "tailwind.config.js",
      `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`
    );
  }

  // Provide default README.md if missing
  if (!files.some((f) => f.path.toLowerCase().includes("readme"))) {
    zip.file(
      "README.md",
      `# ${project.name || "AI Generated Project"}

${project.description || "Generated with AI Web Studio."}

## 🚀 Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run local development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Build for production:**
   \`\`\`bash
   npm run build
   \`\`\`
`
    );
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const safeFilename = `${(project.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-codebase.zip`;

  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
