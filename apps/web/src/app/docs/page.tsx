"use client"

import * as React from "react"
import { BookOpen, Terminal, GraduationCap, Code2, Settings, FileJson, Layers, Play } from "lucide-react"

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

function IntroContent() {
  return (
    <div className="space-y-6 py-10 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold tracking-tight">Progy Documentation</h1>
      <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
        Welcome to the official documentation for Progy, the interactive coding platform that helps you learn by doing.
        Progy combines a powerful CLI with a rich web-based learning environment.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            For Students
          </h3>
          <p className="text-muted-foreground mb-4">
            Learn how to install the CLI, start your first course, and save your progress.
          </p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Code2 className="h-5 w-5 text-primary" />
            For Instructors
          </h3>
          <p className="text-muted-foreground mb-4">
            Create interactive courses, custom runners, and engaging content.
          </p>
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

function StudentFirstCourseContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Your First Course</h1>
      <p className="text-lg text-muted-foreground">
        Follow these steps to start learning with Progy.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Initialize a Course</h2>
        <p className="text-muted-foreground">
          Navigate to a directory where you want to store your course files and run:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          progy init --course rust
        </div>
        <p className="text-sm text-muted-foreground">
          Replace <code>rust</code> with the ID of the course you want to take (e.g., <code>go</code>, <code>typescript</code>).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Start the Environment</h2>
        <p className="text-muted-foreground">
          Once initialized, start the learning platform:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          progy start
        </div>
        <p className="text-muted-foreground">
          This will open your default browser to <code>http://localhost:3000</code> (or the next available port).
        </p>
      </section>
    </div>
  )
}

function StudentCLIContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">CLI Reference</h1>
      <p className="text-lg text-muted-foreground">
        A quick reference for the most common commands you'll use as a student.
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

function StudentPlatformContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Platform Features</h1>
      <p className="text-lg text-muted-foreground">
        The Progy web interface is designed to keep you in the flow.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border text-muted-foreground text-sm">
            [Editor Screenshot Placeholder]
          </div>
          <h3 className="font-semibold">Code Editor</h3>
          <p className="text-sm text-muted-foreground">
            A full-featured code editor with syntax highlighting and basic intelligent completion for the course language.
          </p>
        </div>

        <div className="space-y-2">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border text-muted-foreground text-sm">
            [Terminal/Output Placeholder]
          </div>
          <h3 className="font-semibold">Interactive Runner</h3>
          <p className="text-sm text-muted-foreground">
            See test results in real-time. The runner output is parsed into friendly messages, but you can always view the raw log.
          </p>
        </div>
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
        Runners are the bridge between the student's code and Progy's feedback system.
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
          title: "Your First Course",
          id: "student-first-course",
          icon: Play,
        },
        {
          title: "CLI Reference",
          id: "student-cli",
          icon: Terminal,
        },
        {
          title: "Platform Features",
          id: "student-platform",
          icon: Layers,
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
      case "intro": return <IntroContent />;
      case "installation": return <InstallationContent />;
      case "student-first-course": return <StudentFirstCourseContent />;
      case "student-cli": return <StudentCLIContent />;
      case "student-platform": return <StudentPlatformContent />;
      case "instructor-create": return <InstructorCreateContent />;
      case "instructor-structure": return <InstructorStructureContent />;
      case "instructor-runners": return <InstructorRunnersContent />;
      default: return (
        <div className="space-y-4 py-6">
          <h1 className="text-3xl font-bold">
             {navData.navMain.find(g => g.items.find(i => i.id === activeId))?.items.find(i => i.id === activeId)?.title}
          </h1>
          <div className="p-8 border border-dashed rounded-lg bg-muted/50 text-center text-muted-foreground animate-pulse">
            Content for "{activeId}" is coming soon...
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
