# Refined Improvement Ideas for Progy

Based on your feedback, I've focused these ideas on enhancing the **Course Description rendering** and optimizing the **CLI flow** for both students and instructors.

## 🎨 Markdown Renderer Improvements

The current renderer (implemented in `apps/cli/src/frontend/components/markdown-renderer.tsx`) uses `react-markdown` with basic regex preprocessing. Here is how we can take it to the next level:

### 1. Robust Custom Directives (Native Support)

Instead of using regex for `::note` and `::video`, we should integrate `remark-directives`.

- **Implementation**: Add `remark-directive` and a custom transformer to the `remarkPlugins` chain.
- **Benefit**: Allows complex nesting and attributes, e.g., `:::note{title="Pro Tip"}`.

### 2. Premium Syntax Highlighting

Switch from `rehype-highlight` (Highlight.js) to **Shiki**.

- **Implementation**: Use `@shikijs/rehype`.
- **Benefit**: VS Code-level highlighting accuracy and beautiful themes (e.g., `data-theme="github-dark"`).

### 3. Interactive Code Blocks

Add "Copy to Clipboard" and "Run in Container" buttons directly on code blocks.

- **Implementation**: Wrap the `pre` component in a custom container that holds the logic for copying and triggering the `progy run` command via RPC.

### 4. Mathematical Expressions (LaTeX)

Essential for math-heavy courses.

- **Implementation**: Add `remark-math` and `rehype-katex`.
- **Benefit**: Render formulas like $E=mc^2$ beautifully using TeX syntax.

### 5. Diagrams as Code (Mermaid.js)

Visualize architectures.

- **Implementation**: Use a custom `code` component handler that detects the `mermaid` language and renders it using the `mermaid` package.

### 6. GitHub Flavored Markdown (GFM)

Support for tables, task lists, and autolinks.

- **Implementation**: Add `remark-gfm` plugin.
- **Benefit**: Students can use task lists `[ ]` to check off steps in a README manually.

### 7. Obsidian-style Callouts

Support `> [!INFO]` syntax which is common in modern technical documentation.

- **Implementation**: Use `remark-callouts`.

---
