'use client';

import { useParams, useRouter } from 'next/navigation';
import { authClient } from 'lib/auth-client';
import { useDashboard } from '@/hooks/use-dashboard';
import { Loader2, ArrowLeft, Package, Download, Eye, Calendar, ShieldCheck, AlertTriangle, Trash2, Globe, Lock, ExternalLink, Box } from 'lucide-react';
import { Button } from '@progy/ui/button';
import { Badge } from '@progy/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@progy/ui/card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@progy/ui/dialog';
import ReactMarkdown from 'react-markdown';

export default function PackageDetailsPage() {
  const params = useParams();
  const pkgId = params.id as string;
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { usePackage, deletePackage, updatePackageStatus } = useDashboard(session?.session.token);

  const { data: pkg, isLoading, error } = usePackage(pkgId);

  const handleDelete = async () => {
    try {
      await deletePackage.mutateAsync(pkgId);
      toast.success('Package deleted');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Error deleting package');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await updatePackageStatus.mutateAsync({ pkgId, status });
      toast.success(`Status updated to ${status}`);
      // Invalidate query handled by hook
    } catch (e: any) {
      toast.error(e.message || 'Error updating status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Loading Package...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
        <Package className="w-16 h-16 text-muted-foreground/20 mb-6" />
        <h1 className="text-xl font-black uppercase tracking-tight mb-2">Package Not Found</h1>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Helper for Status Badge (reused logic or component)
  const getStatusBadge = (status: string) => {
    // ... same logic as PackagesTab, simplified for brevity
    return <Badge variant="outline" className="uppercase text-[8px] font-black">{status}</Badge>;
  };

  const latestVersion = pkg.versions?.[0];
  const guard = latestVersion?.guard;
  const manifest = latestVersion?.manifest;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">

        {/* Header Navigation */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-8 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Button>

        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
                  {pkg.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  {getStatusBadge(pkg.status)}
                  {!pkg.isPublic && (
                    <Badge variant="secondary" className="text-[8px] bg-white/5 text-muted-foreground uppercase font-black tracking-widest gap-1">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground italic max-w-2xl text-sm leading-relaxed">
              {pkg.description || "No description provided."}
            </p>
          </div>

          <div className="flex gap-3">
            {pkg.status === 'published' && (
              <Button variant="outline" className="h-10 border-white/10 bg-white/5 uppercase font-black text-[10px] tracking-widest gap-2" asChild>
                <a href={`/courses/${pkg.slug}`} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5" /> View Public Page
                </a>
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="h-10 uppercase font-black text-[10px] tracking-widest gap-2 shadow-lg shadow-destructive/20">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-white/10 rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-white uppercase font-black italic tracking-tight">Delete Package?</DialogTitle>
                  <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={handleDelete} disabled={deletePackage.isPending}>
                    {deletePackage.isPending ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* LEFT COL: Main Info */}
          <div className="md:col-span-2 space-y-8">

            {/* AI Guard Status */}
            <Card className={`border-l-4 ${guard?.passed ? 'border-l-emerald-500 bg-emerald-500/5 border-emerald-500/10' : 'border-l-red-500 bg-red-500/5 border-red-500/10'} border-y border-r border-white/5 rounded-r-3xl rounded-l-md`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  {guard?.passed ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
                  <CardTitle className={`text-base font-black uppercase italic tracking-tight ${guard?.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    AI Security Guard
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm font-medium italic ${guard?.passed ? 'text-emerald-200/60' : 'text-red-200/80'}`}>
                  {guard?.reason || (guard?.passed ? "Passed all security checks." : "Logic analysis pending or failed.")}
                </p>
                {!guard && (
                  <p className="text-xs text-muted-foreground mt-2 italic">No AI analysis available for this version.</p>
                )}
              </CardContent>
            </Card>

            {/* Readme / Details */}
            <Card className="bg-white/5 border-white/5 rounded-3xl overflow-hidden">
              <CardHeader className="bg-white/2 border-b border-white/5 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Manifest & Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {manifest ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Engine</span>
                        <span className="text-sm font-mono text-white">{pkg.latestVersion ? pkg.versions?.find(v => v.version === pkg.latestVersion)?.engineVersion || 'N/A' : 'N/A'}</span>
                      </div>
                      <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Runner</span>
                        <span className="text-sm font-mono text-white">{manifest.runner || 'default'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Modules</span>
                      <div className="flex flex-wrap gap-2">
                        {manifest.modules?.map((m: any, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-white/10 text-zinc-300 border-white/5">
                            {m.title || m.slug}
                          </Badge>
                        )) || <span className="text-muted-foreground italic text-sm">No modules defined</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground italic">No manifest data available</div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COL: Stats & History */}
          <div className="space-y-6">

            {/* Stats */}
            <Card className="bg-primary/5 border-primary/10 rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Downloads</span>
                  <span className="text-xl font-black text-white italic">0</span> {/* Mocked for now */}
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Latest Version</span>
                  <span className="text-xl font-black text-primary italic">{pkg.latestVersion || '0.0.0'}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Updated</span>
                  <span className="text-xs font-bold text-white text-right">{new Date(pkg.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Version History */}
            <Card className="bg-white/5 border-white/5 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Version History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {pkg.versions?.map((v: any) => (
                    <div key={v.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <div className="font-bold text-sm text-white">{v.version}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] border-white/10 text-muted-foreground">{v.sizeBytes ? Math.round(v.sizeBytes / 1024) + ' KB' : 'N/A'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
