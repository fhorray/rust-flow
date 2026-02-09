export interface TocItem {
  id: string;
  label: string;
}

export const tocMap: Record<string, TocItem[]> = {
  intro: [],
  installation: [
    { id: 'prerequisites', label: 'Prerequisites' },
    { id: 'setup', label: 'Setup' },
  ],
  'student-tutorial': [
    { id: 'the-workspace', label: 'The Workspace' },
    { id: 'validation-loop', label: 'Validation Loop' },
  ],
  'student-cli': [
    { id: 'cli-commands', label: 'Commands' },
  ],
  'instructor-create': [
    { id: 'scaffold-a-new-course', label: 'Scaffold a New Course' },
    { id: 'directory-structure', label: 'Directory Structure' },
    { id: 'file-naming-conventions', label: 'File Naming Conventions' },
  ],
  'instructor-structure': [
    { id: 'what-is-a-progy-course', label: 'What is a Progy Course?' },
    { id: 'environment-detection', label: 'Environment Detection' },
  ],
  'instructor-config': [
    { id: 'schema', label: 'Schema' },
    { id: 'runner-types', label: 'Runner Types' },
  ],
  'instructor-srp': [
    { id: 'the-format', label: 'The Format' },
    { id: 'fields-reference', label: 'Fields Reference' },
    { id: 'best-practices', label: 'Best Practices' },
  ],
  'instructor-runners': [
    { id: 'step-1-configuration', label: 'Step 1: Configuration' },
    { id: 'step-2-dockerfile', label: 'Step 2: Dockerfile' },
    { id: 'step-3-the-wrapper-script', label: 'Step 3: Wrapper Script' },
    { id: 'docker-compose-multi-container', label: 'Docker Compose' },
  ],
  'instructor-content': [
    { id: 'module-metadata-infotoml', label: 'Module Metadata' },
    { id: 'markdown-features', label: 'Markdown Features' },
    { id: 'quizzes-quizjson', label: 'Quizzes' },
  ],
  'instructor-cli': [
    { id: 'cli-tools', label: 'CLI Tools' },
    { id: 'scaffolding-shortcuts', label: 'Scaffolding Shortcuts' },
  ],
  'instructor-examples': [
    { id: 'examples', label: 'Examples' },
  ],
};
