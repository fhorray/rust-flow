"use client"

import * as React from "react"
import { BookOpen, Terminal, GraduationCap, Code2, Settings, FileJson, Play, Zap, BrainCircuit, CheckCircle, ChevronRight, X } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

// --- Content Components ---

function IntroContent({ setActiveId }: { setActiveId: (id: string) => void }) {
  return (
    <div className="space-y-6 py-10 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold tracking-tight">Progy Documentation</h1>
      <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
        Welcome to the official documentation for Progy, the interactive coding platform that helps you learn by doing.
        Progy combines a powerful CLI with a rich web-based learning environment.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-start cursor-pointer group" onClick={() => setActiveId('student-tutorial')}>
          <div className="p-2 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Student Tutorial</h3>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            New to Progy? Learn how to start a course, run tests, and use the AI helper in less than 5 minutes.
          </p>
          <div className="mt-auto flex items-center text-sm font-medium text-primary">
            Start Learning <ChevronRight className="ml-1 w-4 h-4" />
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-start cursor-pointer group" onClick={() => setActiveId('instructor-create')}>
          <div className="p-2 rounded-lg bg-secondary text-secondary-foreground mb-4 group-hover:scale-110 transition-transform">
             <Code2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Instructor Guide</h3>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            Want to build your own course? Learn about the course structure, runners, and how to publish.
          </p>
          <div className="mt-auto flex items-center text-sm font-medium text-foreground">
            Create Course <ChevronRight className="ml-1 w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function InstallationContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Installation</h1>
      <p className="text-lg text-muted-foreground">
        Getting started with Progy takes just a few seconds.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Bun</strong> (v1.0.0 or later) is required to run the Progy CLI.
          </li>
          <li>
            <strong className="text-foreground">Git</strong> must be installed and available in your path.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Install via Bun</h2>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          bun install -g progy
        </div>
        <p className="text-muted-foreground">
          Or run it directly using <code>bunx</code>:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          bunx progy --help
        </div>
      </section>
    </div>
  )
}

function StudentTutorialContent() {
    return (
      <div className="space-y-10 py-6 animate-in fade-in duration-500 max-w-3xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest">
            <Zap className="w-4 h-4" /> Quick Start
          </div>
          <h1 className="text-4xl font-black tracking-tight">Interactive Tutorial</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Master the Progy interface. Learn how to verify your code, get AI assistance, and navigate the platform.
          </p>
        </div>

        <div className="grid gap-12 relative border-l-2 border-primary/20 pl-8 ml-4">
          {/* Step 1 */}
          <div className="relative space-y-4">
            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                1
            </div>
            <h3 className="text-xl font-bold">The Workspace</h3>
            <p className="text-muted-foreground">
                When you run <code>progy start</code>, your browser opens the Progy Workspace. This is your command center.
            </p>
            <div className="rounded-xl border bg-muted/30 p-2 shadow-sm">
                 <div className="aspect-[16/9] bg-gradient-to-br from-neutral-900 to-black rounded-lg flex items-center justify-center relative overflow-hidden group">
                     {/* Placeholder for Workspace Screenshot */}
                    <div className="absolute inset-x-0 top-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="flex gap-4 w-full h-full pt-12 px-4 pb-4">
                        <div className="w-1/4 bg-white/5 rounded border border-white/5 p-4 hidden md:block">
                            <div className="w-20 h-3 bg-white/10 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="w-full h-2 bg-white/5 rounded"></div>
                                <div className="w-2/3 h-2 bg-white/5 rounded"></div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded border border-white/5 p-4 font-mono text-xs text-muted-foreground">
                            <span className="text-blue-400">fn</span> main() {'{'} <br/>
                            &nbsp;&nbsp; println!(<span className="text-green-400">&quot;Hello World&quot;</span>); <br/>
                            {'}'}
                        </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-background/80 text-foreground px-3 py-1 rounded-full text-xs font-bold border shadow-lg">Editor View</span>
                    </div>
                 </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative space-y-4">
             <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                2
            </div>
            <h3 className="text-xl font-bold">Running Tests</h3>
            <p className="text-muted-foreground">
                After editing your code (e.g., <code>main.rs</code>), save the file. Progy automatically detects changes.
                Click the <span className="text-foreground font-bold bg-muted px-1.5 py-0.5 rounded text-xs">Run Tests</span> button or press <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border">Cmd+Enter</kbd> to verify your solution.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 rounded-lg border bg-card flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                        <CheckCircle className="w-4 h-4" /> Tests Passed
                    </div>
                    <p className="text-xs text-muted-foreground">
                        If your code is correct, you&apos;ll see a green success message and can proceed to the next lesson.
                    </p>
                </div>
                <div className="flex-1 p-4 rounded-lg border bg-card flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                        <X className="w-4 h-4" /> Compilation Error
                    </div>
                    <p className="text-xs text-muted-foreground">
                        If there are errors, Progy provides a detailed breakdown of what went wrong.
                    </p>
                </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative space-y-4">
            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                3
            </div>
            <h3 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                AI Assistance
            </h3>
            <p className="text-muted-foreground">
                Stuck? Progy&apos;s AI Mentor is context-aware. It knows the exercise constraints and your current code.
            </p>
            <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Zap className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
                    <div>
                        <span className="font-bold text-sm block mb-1">Get Hint</span>
                        <p className="text-xs text-muted-foreground">Provides a subtle nudge in the right direction without revealing the answer.</p>
                    </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <BookOpen className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                    <div>
                        <span className="font-bold text-sm block mb-1">Explain Code</span>
                        <p className="text-xs text-muted-foreground">Highlights complex syntax or logic in your code and explains it in plain English.</p>
                    </div>
                </li>
            </ul>
          </div>
        </div>
      </div>
    )
}

function StudentCLIContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">CLI Reference</h1>
      <p className="text-lg text-muted-foreground">
        A quick reference for the most common commands you&apos;ll use as a student.
      </p>

      <div className="grid gap-4">
        {[
          { cmd: "progy init", desc: "Initialize a new course in the current directory." },
          { cmd: "progy start", desc: "Start the local server and open the UI." },
          { cmd: "progy save", desc: "Save your progress to the cloud (Git push)." },
          { cmd: "progy sync", desc: "Pull official updates and sync your progress." },
          { cmd: "progy reset <file>", desc: "Restore a file to its original state." },
        ].map((item) => (
          <div key={item.cmd} className="flex flex-col gap-1 p-4 border rounded-lg bg-card/50">
            <code className="font-mono font-semibold text-primary">{item.cmd}</code>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function InstructorCreateContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Creating a Course</h1>
      <p className="text-lg text-muted-foreground">
        Progy makes it easy to author interactive courses.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Scaffold</h2>
        <p className="text-muted-foreground">
          Use the CLI to create a new course structure:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          progy create-course --name my-course --course rust
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Develop</h2>
        <p className="text-muted-foreground">
          Start the development server to see your course in action:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          progy dev
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. Validate & Pack</h2>
        <p className="text-muted-foreground">
          Before distributing, ensure your course is valid:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          progy validate<br />
          progy pack --out my-course-v1.progy
        </div>
      </section>
    </div>
  )
}

function InstructorStructureContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Course Structure</h1>
      <p className="text-lg text-muted-foreground">
        Understanding the anatomy of a Progy course.
      </p>

      <div className="grid gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-mono font-bold text-primary">course.json</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The configuration file defining the course ID, name, and runner command.
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-mono font-bold text-primary">content/</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Contains subdirectories for each lesson (e.g., <code>01_intro</code>, <code>02_variables</code>).
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-mono font-bold text-primary">runner/</h3>
          <p className="text-sm text-muted-foreground mt-1">
            (Optional) Custom scripts to compile/test student code.
          </p>
        </div>
      </div>

      <section className="space-y-4 mt-6">
        <h2 className="text-xl font-semibold">Example Layout</h2>
        <pre className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
{`my-course/
├── course.json
├── SETUP.md
├── runner/
│   └── index.js
└── content/
    ├── 01_intro/
    │   ├── README.md
    │   └── main.rs
    └── 02_variables/
        ├── README.md
        └── main.rs`}
        </pre>
      </section>
    </div>
  )
}

function InstructorRunnersContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Runners</h1>
      <p className="text-lg text-muted-foreground">
        Runners are the bridge between the student&apos;s code and Progy&apos;s feedback system.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How it Works</h2>
        <p className="text-muted-foreground">
          When a student runs code, Progy executes the command defined in <code>course.json</code>.
          The runner receives the path to the exercise, runs tests, and prints a JSON result to stdout.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The Contract (SRP)</h2>
        <p className="text-muted-foreground">
          Your runner must output a JSON object wrapped in <code>__SRP_BEGIN__</code> and <code>__SRP_END__</code> markers.
        </p>
        <pre className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto text-muted-foreground">
{`{
  "success": true,
  "summary": "All tests passed",
  "tests": [
    { "name": "Test 1", "status": "pass" }
  ]
}`}
        </pre>
      </section>
    </div>
  )
}


// --- Navigation Structure ---

const navData = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Introduction",
          id: "intro",
          icon: BookOpen,
        },
        {
          title: "Installation",
          id: "installation",
          icon: Terminal,
        },
      ],
    },
    {
      title: "Student Guide",
      url: "#",
      items: [
        {
          title: "Tutorial: How to Use",
          id: "student-tutorial",
          icon: Play,
        },
        {
          title: "CLI Reference",
          id: "student-cli",
          icon: Terminal,
        },
      ],
    },
    {
      title: "Instructor Guide",
      url: "#",
      items: [
        {
          title: "Creating a Course",
          id: "instructor-create",
          icon: Code2,
        },
        {
          title: "Course Structure",
          id: "instructor-structure",
          icon: FileJson,
        },
        {
          title: "Writing Runners",
          id: "instructor-runners",
          icon: Settings,
        },
      ],
    },
  ],
}

// --- Main Page Component ---

export default function DocsPage() {
  const [activeId, setActiveId] = React.useState("intro")

  const renderContent = () => {
    switch (activeId) {
      case "intro": return <IntroContent setActiveId={setActiveId} />;
      case "installation": return <InstallationContent />;
      case "student-tutorial": return <StudentTutorialContent />;
      case "student-cli": return <StudentCLIContent />;
      case "instructor-create": return <InstructorCreateContent />;
      case "instructor-structure": return <InstructorStructureContent />;
      case "instructor-runners": return <InstructorRunnersContent />;
      default: return (
        <div className="space-y-4 py-6">
          <h1 className="text-3xl font-bold">
             {navData.navMain.find(g => g.items.find(i => i.id === activeId))?.items.find(i => i.id === activeId)?.title}
          </h1>
          <div className="p-8 border border-dashed rounded-lg bg-muted/50 text-center text-muted-foreground animate-pulse">
            Content for &quot;{activeId}&quot; is coming soon...
          </div>
        </div>
      );
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeId={activeId} setActiveId={setActiveId} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Documentation</span>
            <span>/</span>
            <span className="font-medium text-foreground">
              {navData.navMain.find(g => g.items.find(i => i.id === activeId))?.items.find(i => i.id === activeId)?.title || "Intro"}
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-10 max-w-4xl mx-auto w-full">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar({ activeId, setActiveId }: { activeId: string, setActiveId: (id: string) => void }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Progy</span>
            <span className="truncate text-xs">Documentation</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navData.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={activeId === item.id}
                      onClick={() => setActiveId(item.id)}
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
