import { Zap, Menu } from 'lucide-react';
import { navData } from './nav-data';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface DocsSidebarProps {
  activeId: string;
  setActiveId: (id: string) => void;
}

function SidebarNav({
  activeId,
  setActiveId,
  onNavigate,
}: DocsSidebarProps & { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-border flex items-center px-5 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
            style={{ boxShadow: 'var(--shadow-orange)' }}
          >
            <Zap className="text-primary-foreground h-4 w-4" />
          </div>
          <div className="grid text-left leading-tight">
            <span className="font-extrabold text-base tracking-tighter text-foreground">
              PROGY
            </span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">
              Docs
            </span>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-3">
        {navData.navMain.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveId(item.id);
                      onNavigate?.();
                    }}
                    className={`w-full flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export function DocsSidebar({ activeId, setActiveId }: DocsSidebarProps) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-card/50 h-screen sticky top-0">
      <SidebarNav activeId={activeId} setActiveId={setActiveId} />
    </aside>
  );
}

export function MobileSidebarTrigger({
  activeId,
  setActiveId,
}: DocsSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 bg-card border-border">
        <SidebarNav
          activeId={activeId}
          setActiveId={setActiveId}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
