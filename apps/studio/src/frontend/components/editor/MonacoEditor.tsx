import React, { useEffect, useRef, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { updateTabContent, saveActiveFile } from '../../stores/editor-store';

interface MonacoEditorProps {
  initialContent: string;
  path: string;
}

function getLanguage(path: string): string {
  const fileName = path.split('/').pop()?.toLowerCase() || '';
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (fileName === 'dockerfile') return 'dockerfile';
  if (fileName === 'makefile') return 'makefile';

  switch (ext) {
    case 'rs': return 'rust';
    case 'py': return 'python';
    case 'js':
    case 'jsx': return 'javascript';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'json': return 'json';
    case 'sql': return 'sql';
    case 'c':
    case 'h': return 'c';
    case 'cpp':
    case 'hpp': return 'cpp';
    case 'go': return 'go';
    case 'md': return 'markdown';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'yaml':
    case 'yml': return 'yaml';
    case 'toml': return 'ini';
    case 'sh':
    case 'bash':
    case 'zsh': return 'shell';
    case 'xml': return 'xml';
    case 'java': return 'java';
    default: return 'plaintext';
  }
}

export function MonacoEditor({ initialContent, path }: MonacoEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const [language, setLanguage] = useState(getLanguage(path));

  useEffect(() => {
    setLanguage(getLanguage(path));
  }, [path]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Add Save Command (Cmd+S / Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveActiveFile();
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateTabContent(path, value);
    }
  };

  useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });
    }
  }, [monaco]);

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={initialContent}
        theme="vs-dark"
        path={path}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
