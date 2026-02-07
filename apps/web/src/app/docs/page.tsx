export default function DocsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8 text-center">
      <h1 className="text-4xl font-bold text-gradient mb-4">Progy Documentation</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        This area is under construction. We are working hard to bring you the best documentation for Progy.
      </p>
      <div className="p-8 border border-dashed border-primary/30 rounded-2xl bg-primary/5">
        <p className="text-primary font-mono text-xl animate-pulse">
          TODO: Render Documentation Content
        </p>
      </div>
      <a href="/" className="mt-12 text-sm hover:text-primary transition-colors underline underline-offset-4">
        Back to Home
      </a>
    </div>
  );
}
