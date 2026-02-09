import {
  BookOpen,
  Terminal,
  Play,
  Command,
  FileJson,
  Settings,
  Zap,
  BrainCircuit,
  Code2,
  FolderTree,
  Layers,
  Puzzle,
  FileText,
  Rocket,
} from 'lucide-react';

export const navData = {
  navMain: [
    {
      title: 'Getting Started',
      items: [
        { title: 'Introduction', id: 'intro', icon: BookOpen },
        { title: 'Installation', id: 'installation', icon: Terminal },
      ],
    },
    {
      title: 'Student Guide',
      items: [
        { title: 'The Workspace', id: 'student-tutorial', icon: Play },
        { title: 'CLI Reference', id: 'student-cli', icon: Command },
      ],
    },
    {
      title: 'Instructor Guide',
      items: [
        { title: 'Creating Courses', id: 'instructor-create', icon: Rocket },
        { title: 'Course Structure', id: 'instructor-structure', icon: FolderTree },
        { title: 'Configuration', id: 'instructor-config', icon: FileJson },
        { title: 'Smart Runner (SRP)', id: 'instructor-srp', icon: Zap },
        { title: 'Custom Runners', id: 'instructor-runners', icon: Settings },
        { title: 'Content & Quizzes', id: 'instructor-content', icon: FileText },
        { title: 'CLI Tools', id: 'instructor-cli', icon: Command },
        { title: 'Complete Examples', id: 'instructor-examples', icon: Code2 },
      ],
    },
  ],
};
