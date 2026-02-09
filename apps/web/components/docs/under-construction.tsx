import { Settings } from 'lucide-react';

export function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-3xl bg-card/50">
      <div className="p-4 rounded-full bg-muted">
        <Settings className="animate-spin text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-bold text-foreground">Module Under Construction</h3>
        <p className="text-sm text-muted-foreground">
          We are working hard to document this section.
        </p>
      </div>
    </div>
  );
}
