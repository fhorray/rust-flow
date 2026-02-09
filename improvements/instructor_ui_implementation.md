# Visual Course Editor & Instructor UI Implementation Plan

This document details the comprehensive implementation plan for the **Visual Course Editor (Instructor UI)** in Progy. This feature transforms the CLI-based course creation workflow into a powerful, visual, web-based IDE. Instructors will be able to create, edit, and manage course content using a rich text editor (Tiptap), leverage AI for content generation, and visually configure course settings, all while seeing a real-time preview of the student experience.

## 1. Overview & Architecture

The Visual Course Editor will be an extension of the existing local development server (`progy dev`). It will serve a new React-based Single Page Application (SPA) route specifically designed for instructors.

### 1.1. Core Features
*   **Dual-View Interface:** Split-screen layout with "Editor" on the left and "Student Preview" on the right.
*   **File System Manager:** A visual file tree representing the `content/` and `exercises/` directories, allowing drag-and-drop organization.
*   **Rich Text Editor (Tiptap):** A Notion-like experience for editing `README.md` files, supporting slash commands, code blocks, and images.
*   **Visual Configuration:** Form-based editors for `course.json` (global settings) and `info.toml` (module metadata), utilizing **TanStack Form** for complex state and validation.
*   **AI Assistant:** Integrated LLM support (OpenAI/Anthropic) to:
    *   Draft lesson content based on a topic.
    *   Generate code exercises and solutions.
    *   Create quizzes automatically from lesson content.
*   **Asset Management:** Upload and manage images/diagrams directly into the course folder.
*   **State Management:** Utilizing **Nanostores** (already present in `apps/web`) for reactivity across the editor components.

### 1.2. Architecture Diagram

```mermaid
graph TD
    User[Instructor] -->|progy dev --ui| CLI
    CLI -->|Starts| LocalServer[Backend Server (Hono)]
    LocalServer -->|Serves| SPA[React Frontend]

    subgraph Frontend
        SPA -->|Route: /editor| EditorUI
        EditorUI -->|Store: Nanostores| UIStore
        EditorUI -->|Component| FileTree
        EditorUI -->|Component| TiptapEditor
        EditorUI -->|Component| ConfigForm
        EditorUI -->|Component| AI_Panel
        EditorUI -->|Iframe| StudentPreview
    end

    subgraph Backend
        LocalServer -->|API: /instructor/fs| FileSystem[Node FS]
        LocalServer -->|API: /instructor/ai| AI_Service[LLM Client]
        LocalServer -->|API: /instructor/config| ConfigManager
        FileSystem -->|Reads/Writes| LocalDisk[Course Directory]
    end
```

## 2. CLI Command Update

We will introduce a new flag `--ui` to the `dev` command to launch the editor mode.

### 2.1. `apps/cli/src/commands/course.ts`

```typescript
// apps/cli/src/commands/course.ts

import { Command } from "commander";
// ... imports ...

program
  .command("dev")
  .description("Test course locally")
  .option("--ui", "Launch the Visual Course Editor") // New Flag
  .action(dev);

export async function dev(options: { offline?: boolean, ui?: boolean }) {
  const cwd = process.cwd();
  // ... validation ...

  if (options.ui) {
    logger.info("🎨 Launching Visual Course Editor...");
  }

  // Pass 'ui' flag to runServer which sets PROGY_EDITOR_MODE env var
  await runServer(cwd, true, null, false, options.ui);
}
```

### 2.2. `apps/cli/src/cli.ts`

```typescript
// apps/cli/src/cli.ts

async function runServer(runtimeCwd: string, isOffline: boolean, containerFile: string | null, bypass: boolean, isEditor: boolean) {
  // ...
  const child = spawn("bun", ["run", serverPath], {
    env: {
      ...process.env,
      PROGY_EDITOR_MODE: isEditor ? "true" : "false" // Inject Env Var
    },
  });
  // ...
}
```

## 3. Backend API: Instructor Endpoints

To support the editor, the backend needs privileged access to the file system. These endpoints will only be active when `PROGY_EDITOR_MODE=true`.

We will create a new file `apps/cli/src/backend/endpoints/instructor.ts`.

### 3.1. File System Operations (`/instructor/fs`)

This endpoint handles CRUD operations for files and directories.

```typescript
// apps/cli/src/backend/endpoints/instructor.ts

import { join, dirname } from "node:path";
import { readFile, writeFile, mkdir, rename, rm, readdir, stat } from "node:fs/promises";
import type { ServerType } from "../types";
import { PROG_CWD } from "../helpers";

// Helper to sanitize paths (prevent directory traversal)
const sanitizePath = (p: string) => {
  const resolved = join(PROG_CWD, p);
  if (!resolved.startsWith(PROG_CWD)) throw new Error("Access denied");
  return resolved;
};

export const fsHandler: ServerType<"/instructor/fs"> = async (req) => {
  const method = req.method;
  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || "";
  const typeParam = url.searchParams.get("type") || "file"; // file | dir

  try {
    const absPath = sanitizePath(pathParam);

    // READ
    if (method === "GET") {
      if (typeParam === "dir") {
        const entries = await readdir(absPath, { withFileTypes: true });
        const tree = entries.map(e => ({
          name: e.name,
          type: e.isDirectory() ? "dir" : "file",
          path: join(pathParam, e.name)
        }));
        return Response.json({ success: true, data: tree });
      } else {
        const content = await readFile(absPath, "utf-8");
        return Response.json({ success: true, content });
      }
    }

    // CREATE / UPDATE
    if (method === "POST" || method === "PUT") {
      const { content } = await req.json() as { content?: string };

      if (typeParam === "dir") {
        await mkdir(absPath, { recursive: true });
      } else {
        await mkdir(dirname(absPath), { recursive: true });
        await writeFile(absPath, content || "");
      }
      return Response.json({ success: true });
    }

    // DELETE
    if (method === "DELETE") {
      await rm(absPath, { recursive: true, force: true });
      return Response.json({ success: true });
    }

    // MOVE / RENAME
    if (method === "PATCH") {
      const { newPath } = await req.json() as { newPath: string };
      const absNewPath = sanitizePath(newPath);
      await mkdir(dirname(absNewPath), { recursive: true });
      await rename(absPath, absNewPath);
      return Response.json({ success: true });
    }

  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};
```

### 3.2. AI Generation Endpoint (`/instructor/ai`)

This endpoint acts as a proxy to LLM providers (e.g., OpenAI). It constructs prompts based on the requested task.

```typescript
// apps/cli/src/backend/endpoints/instructor.ts

import { OpenAI } from "openai"; // Pseudo-code dependency
import { getGlobalConfig } from "../core/config";

export const aiHandler: ServerType<"/instructor/ai"> = async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { task, context } = await req.json();
  // task: "draft_lesson" | "generate_quiz" | "fix_code"
  // context: { topic: "Loops", currentContent: "..." }

  // Load API Key from global config
  const config = await getGlobalConfig();
  const apiKey = config.ai?.openai_key;

  if (!apiKey) {
    return Response.json({ success: false, error: "Missing AI API Key. Run 'progy config set ai.openai_key <key>'" });
  }

  const client = new OpenAI({ apiKey });
  let systemPrompt = "You are an expert programming instructor.";
  let userPrompt = "";

  switch (task) {
    case "draft_lesson":
      systemPrompt += " Create a clear, engaging lesson in Markdown.";
      userPrompt = `Write a lesson about "${context.topic}". Include code examples in ${context.language}.`;
      break;
    case "generate_quiz":
      systemPrompt += " Create a multiple-choice quiz in JSON format.";
      userPrompt = `Based on this content: "${context.currentContent}", generate 3 quiz questions.`;
      break;
  }

  try {
    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      stream: true,
    });

    // Return a readable stream to the frontend
    return new Response(stream.toReadableStream());
  } catch (e: any) {
    return Response.json({ success: false, error: e.message });
  }
};
```

### 3.3. Configuration Management (`/instructor/config`)

Endpoints to read/write `course.json` and `info.toml` safely.

```typescript
// apps/cli/src/backend/endpoints/instructor.ts

import { readFile, writeFile } from "node:fs/promises";
import { COURSE_CONFIG_PATH } from "../helpers";

export const configHandler: ServerType<"/instructor/config"> = async (req) => {
  if (req.method === "GET") {
    // Return parsed JSON of course.json
    // ...
  }
  if (req.method === "POST") {
    // Validate and write updates to course.json
    const updates = await req.json();
    // Use Zod schema to validate before writing
    // ...
    await writeFile(COURSE_CONFIG_PATH, JSON.stringify(updates, null, 2));
    return Response.json({ success: true });
  }
};
```

## 4. Frontend State Management (Nanostores)

We will use Nanostores to manage the editor state, as requested. This is lightweight and fits the existing tech stack.

### 4.1. `editorStore.ts`

```typescript
// apps/web/src/stores/editorStore.ts

import { atom, map, computed } from 'nanostores';

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[]; // Loaded on demand
  isExpanded?: boolean;
};

export type EditorTab = {
  path: string;
  content: string;
  isDirty: boolean;
  type: 'markdown' | 'config' | 'code';
};

// Atoms
export const $fileTree = atom<FileNode[]>([]);
export const $activeTabPath = atom<string | null>(null);
export const $openTabs = map<Record<string, EditorTab>>({});

// Actions
export function openFile(file: FileNode) {
  const tabs = $openTabs.get();
  if (!tabs[file.path]) {
    // Fetch content (mock async)
    fetch(`/instructor/fs?path=${file.path}`).then(async res => {
      const data = await res.json();
      $openTabs.setKey(file.path, {
        path: file.path,
        content: data.content,
        isDirty: false,
        type: file.path.endsWith('.md') ? 'markdown' : 'code'
      });
      $activeTabPath.set(file.path);
    });
  } else {
    $activeTabPath.set(file.path);
  }
}

export function updateTabContent(path: string, content: string) {
  const tabs = $openTabs.get();
  if (tabs[path]) {
    $openTabs.setKey(path, { ...tabs[path], content, isDirty: true });
  }
}

export async function saveActiveFile() {
  const path = $activeTabPath.get();
  if (!path) return;
  const tabs = $openTabs.get();
  const tab = tabs[path];

  if (tab && tab.isDirty) {
    await fetch('/instructor/fs', {
      method: 'PUT',
      body: JSON.stringify({ content: tab.content }),
      headers: { 'Content-Type': 'application/json' }
    });
    $openTabs.setKey(path, { ...tab, isDirty: false });
  }
}
```

## 5. Frontend Implementation (React)

### 5.1. Editor Layout (`EditorLayout.tsx`)

Using `react-resizable-panels` for a flexible IDE-like layout.

```tsx
// apps/web/src/components/editor/EditorLayout.tsx

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useStore } from '@nanostores/react';
import { $activeTabPath, $openTabs } from '../../stores/editorStore';
import { FileTree } from "./FileTree";
import { MarkdownEditor } from "./MarkdownEditor";
import { ConfigForm } from "./ConfigForm";
import { StudentPreview } from "./StudentPreview";

export function EditorLayout() {
  const activePath = useStore($activeTabPath);
  const openTabs = useStore($openTabs);
  const activeTab = activePath ? openTabs[activePath] : null;

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans">
      <header className="h-12 border-b border-gray-800 flex items-center px-4 bg-gray-950">
        <span className="font-bold text-lg text-blue-400">Progy Studio</span>
        <div className="ml-auto flex gap-2">
           <button className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-500">
             Save All
           </button>
           <button className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-500">
             Deploy
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-gray-900 border-r border-gray-800">
            <FileTree />
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-blue-500 transition-colors" />

          <Panel defaultSize={50} minSize={30}>
            {activeTab?.type === 'markdown' && <MarkdownEditor initialContent={activeTab.content} path={activeTab.path} />}
            {activeTab?.type === 'config' && <ConfigForm />}
            {!activeTab && <div className="flex items-center justify-center h-full text-gray-500">Select a file to edit</div>}
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-blue-500 transition-colors" />

          <Panel defaultSize={30} minSize={20}>
            <StudentPreview />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
```

### 5.2. File Tree (`FileTree.tsx`)

A recursive component that visualizes the file structure.

```tsx
// apps/web/src/components/editor/FileTree.tsx

import { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { openFile } from '../../stores/editorStore';

type FileNode = { name: string; path: string; type: 'file' | 'dir' };

const FileTreeNode = ({ node, level = 0 }: { node: FileNode, level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<FileNode[]>([]);

  const handleToggle = async () => {
    if (node.type === 'dir') {
      if (!isOpen && children.length === 0) {
        const res = await fetch(`/instructor/fs?path=${node.path}&type=dir`);
        const data = await res.json();
        setChildren(data.data);
      }
      setIsOpen(!isOpen);
    } else {
      openFile(node);
    }
  };

  return (
    <div>
      <div
        className="flex items-center px-2 py-1 hover:bg-gray-800 cursor-pointer text-sm text-gray-300 select-none"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleToggle}
      >
        <span className="mr-1 w-4">
          {node.type === 'dir' && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>
        {node.type === 'dir' ? <Folder size={14} className="mr-2 text-blue-400" /> : <File size={14} className="mr-2 text-gray-400" />}
        {node.name}
      </div>
      {isOpen && children.map(child => (
        <FileTreeNode key={child.path} node={child} level={level + 1} />
      ))}
    </div>
  );
};

export function FileTree() {
  const [rootFiles, setRootFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    fetch('/instructor/fs?path=.&type=dir')
      .then(res => res.json())
      .then(data => setRootFiles(data.data));
  }, []);

  return (
    <div className="h-full overflow-y-auto py-2">
      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Explorer</div>
      {rootFiles.map(file => <FileTreeNode key={file.path} node={file} />)}
    </div>
  );
}
```

### 5.3. Markdown Editor (`MarkdownEditor.tsx`) with Tiptap

Integrating Tiptap for a rich Markdown editing experience.

```tsx
// apps/web/src/components/editor/MarkdownEditor.tsx

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { updateTabContent } from '../../stores/editorStore';
import { AIAssistant } from './AIAssistant';

export function MarkdownEditor({ initialContent, path }: { initialContent: string, path: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        transformPastedText: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Debounce this in production
      updateTabContent(path, editor.storage.markdown.getMarkdown());
    },
  });

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="border-b border-gray-800 p-2 flex items-center gap-2 bg-gray-950">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1 rounded ${editor.isActive('codeBlock') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
        >
          Code
        </button>
        <div className="ml-auto">
            <AIAssistant onInsert={(text) => editor.chain().focus().insertContent(text).run()} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

### 5.4. Configuration Form (`ConfigForm.tsx`) with TanStack Form

Using **TanStack Form** for robust form management, validation, and reactivity.

```tsx
// apps/web/src/components/editor/ConfigForm.tsx

import { useForm } from '@tanstack/react-form';
import type { FieldApi } from '@tanstack/react-form';
import { z } from 'zod';

// Define schema for Course Configuration
const courseConfigSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 chars"),
  title: z.string().min(5, "Title is too short"),
  description: z.string().optional(),
  progression: z.object({
    mode: z.enum(["sequential", "open"]),
    strict_module_order: z.boolean(),
  }),
});

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className="text-red-500 text-xs ml-2">{field.state.meta.errors.join(", ")}</em>
      ) : null}
    </>
  );
}

export function ConfigForm() {
  const form = useForm({
    defaultValues: {
      id: 'my-course',
      title: 'My Awesome Course',
      description: 'Learn things fast.',
      progression: {
        mode: 'sequential',
        strict_module_order: true
      }
    },
    onSubmit: async ({ value }) => {
      console.log('Saving config:', value);
      await fetch('/instructor/config', {
        method: 'POST',
        body: JSON.stringify(value),
        headers: { 'Content-Type': 'application/json' }
      });
      alert("Configuration saved!");
    },
    validators: {
      onChange: courseConfigSchema // Zod validation
    }
  });

  return (
    <div className="p-8 max-w-2xl mx-auto text-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Course Configuration</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Course ID Field */}
        <form.Field
          name="id"
          children={(field) => (
            <div>
              <label className="block text-sm font-medium mb-1">Course ID</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Title Field */}
        <form.Field
          name="title"
          children={(field) => (
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Nested Progression Fields */}
        <div className="p-4 border border-gray-700 rounded bg-gray-800/50">
          <h3 className="font-semibold mb-4 text-gray-300">Progression Rules</h3>

          <form.Field
            name="progression.mode"
            children={(field) => (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="sequential">Sequential (Lock Next)</option>
                  <option value="open">Open Navigation</option>
                </select>
              </div>
            )}
          />

          <form.Field
            name="progression.strict_module_order"
            children={(field) => (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-300">Enforce strict module order</span>
              </div>
            )}
          />
        </div>

        <div className="pt-4">
            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Save Configuration'}
                </button>
                )}
            />
        </div>
      </form>
    </div>
  );
}
```

### 5.5. AI Assistant Panel (`AIAssistant.tsx`)

A floating or embedded panel to interact with the LLM backend.

```tsx
// apps/web/src/components/editor/AIAssistant.tsx

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export function AIAssistant({ onInsert }: { onInsert: (text: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/instructor/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'draft_lesson',
          context: { topic: prompt, language: 'typescript' }
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          onInsert(text); // Stream directly into editor!
        }
      }
    } catch (e) {
      console.error(e);
      alert("AI Generation failed");
    } finally {
      setIsGenerating(false);
      setIsOpen(false);
      setPrompt("");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-medium text-white transition-colors"
      >
        <Sparkles size={12} />
        Ask AI
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 z-50">
          <h4 className="text-sm font-semibold mb-2 text-purple-400">Generate Content</h4>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 mb-3 focus:ring-1 focus:ring-purple-500 outline-none"
            rows={3}
            placeholder="E.g., Explain React Hooks with examples..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs text-white font-medium"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 6. CSS / Tailwind Utilities

The UI relies on standard Tailwind CSS classes. Ensure `tailwind.config.js` in `apps/web` includes these paths and extends colors if necessary.

```js
// apps/web/tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/editor/**/*.{js,ts,jsx,tsx}" // Ensure editor components are scanned
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0B0C10', // Darker background for header
          900: '#111827', // Main background
          800: '#1F2937', // Panel borders/secondary
          // ... standard palette
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Required for .prose in MarkdownEditor
  ],
}
```

## 7. Security Considerations

*   **Localhost Only:** The `/instructor/*` endpoints must **strictly** block requests from external origins and should typically only bind to `127.0.0.1`.
*   **Path Sanitization:** The `fsHandler` must prevent `../../` traversal to ensure it can only read/write within the course directory (`PROG_CWD`).
*   **Environment Check:** These endpoints should return 404 or 403 if `PROGY_EDITOR_MODE` is not enabled, preventing accidental exposure in student environments.

## 8. Dependencies to Add

**Frontend (`apps/web`):**
*   `react-resizable-panels`: For split views.
*   `@tiptap/react`, `@tiptap/starter-kit`, `tiptap-markdown`: For the editor.
*   `lucide-react`: For UI icons.
*   `@tanstack/react-form`: For robust form handling.
*   `zod`: For schema validation.
*   `nanostores`, `@nanostores/react`: For state management (already present).

**Backend (`apps/cli`):**
*   `openai`: For AI integration (or use raw fetch).
*   `zod`: For validation (already present).

---
*End of Instructor UI Implementation Plan*
