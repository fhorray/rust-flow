import { GraduationCap, Code2, ChevronRight, Zap } from 'lucide-react';

interface IntroContentProps {
  setActiveId: (id: string) => void;
}

export function IntroContent({ setActiveId }: IntroContentProps) {
  return (
    <div className="space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest">
          <Zap className="w-3 h-3" /> Build · Solve · Verify
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">
          Progy <span className="text-primary italic">Docs.</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          The next generation interactive coding platform. Learn, build, and
          distribute courses with a seamless CLI-to-Web experience.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 pt-4">
        <button
          onClick={() => setActiveId('student-tutorial')}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-left transition-all hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <GraduationCap size={100} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="mb-5 inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Student Path</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Master the platform, run your first tests, and unlock AI-powered coding mentorship.
            </p>
            <div className="flex items-center text-sm font-semibold text-primary">
              Quick Start Tutorial
              <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveId('instructor-create')}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-left transition-all hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Code2 size={100} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="mb-5 inline-flex p-3 rounded-xl bg-secondary text-secondary-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Instructor Path</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Learn the Progy Schema, custom runner protocols, and how to publish your own curriculum.
            </p>
            <div className="flex items-center text-sm font-semibold text-secondary-foreground">
              Create a Course
              <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 pt-4">
        {[
          { label: 'Git-Native', desc: 'Courses are repos. Clone, learn, push.' },
          { label: 'Any Language', desc: 'Python, Rust, Go, SQL, TypeScript...' },
          { label: 'Smart Feedback', desc: 'SRP protocol for rich test results.' },
        ].map((f) => (
          <div key={f.label} className="p-4 rounded-xl border border-border bg-card/50">
            <span className="text-sm font-bold text-foreground">{f.label}</span>
            <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
