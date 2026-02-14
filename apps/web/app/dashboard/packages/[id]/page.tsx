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
  const { usePackage, deletePackage, updatePackage } = useDashboard(session?.session.token);

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

  const handleUpdateStatus = async (data: any) => {
    try {
      await updatePackage.mutateAsync({ pkgId, data });
      toast.success(`Package updated successfully`);
    } catch (e: any) {
      toast.error(e.message || 'Error updating package');
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
    <div className="min-h-screen bg-transparent font-sans selection:bg-primary/20 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

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
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl shadow-black/50">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
                  {pkg.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {getStatusBadge(pkg.status)}
                  {!pkg.isPublic && (
                    <Badge variant="secondary" className="text-[10px] bg-white/5 text-muted-foreground uppercase font-black tracking-widest gap-1 px-2">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">v{latestVersion?.version || '0.0.0'}</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground font-medium max-w-2xl text-base leading-relaxed mt-4 pl-1">
              {pkg.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
            {pkg.status === 'published' && (
              <Button variant="outline" className="h-11 px-6 border-white/10 bg-zinc-900/50 hover:bg-white/10 uppercase font-black text-[10px] tracking-widest gap-2 rounded-xl transition-all active:scale-95" asChild>
                <a href={`/courses/${pkg.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4" /> View Public Page
                </a>
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="h-11 px-6 uppercase font-black text-[10px] tracking-widest gap-2 rounded-xl transition-all active:scale-95">
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Package</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <strong>{pkg.name}</strong>? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deletePackage.isPending}
                  >
                    {deletePackage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : 'Delete Package'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COL: Stats & Config */}
          <div className="space-y-6 lg:col-span-2">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/40 border-white/5 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Downloads</span>
                  <div className="text-2xl font-black italic text-white">{pkg.downloads || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/40 border-white/5 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Version</span>
                  <div className="text-2xl font-black italic text-primary">{pkg.latestVersion || '0.0.0'}</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/40 border-white/5 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Size</span>
                  <div className="text-xl font-bold italic text-zinc-300">
                    {latestVersion?.sizeBytes ? Math.round(latestVersion.sizeBytes / 1024) + ' KB' : 'N/A'}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/40 border-white/5 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Updated</span>
                  <div className="text-sm font-bold text-zinc-400">{new Date(pkg.updatedAt).toLocaleDateString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* AI Guard Status */}
            <Card className={`border ${guard?.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'} rounded-3xl overflow-hidden`}>
              <CardHeader className="pb-3 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-3">
                  {guard?.passed ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                  <CardTitle className={`text-sm font-black uppercase italic tracking-wider ${guard?.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    AI Security Guard
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className={`text-sm font-medium leading-relaxed ${guard?.passed ? 'text-emerald-200/70' : 'text-red-200/80'}`}>
                  {guard?.reason || (guard?.passed ? "Passed all security checks." : "Logic analysis pending or failed.")}
                </p>
                {!guard && (
                  <p className="text-xs text-muted-foreground italic">No AI analysis available for this version.</p>
                )}
              </CardContent>
            </Card>

            {/* Manifest / Config / Settings */}
            <Card className="bg-zinc-900/30 border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
              <CardHeader className="bg-white/2 border-b border-white/5 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Box className="w-3.5 h-3.5" /> Manifest & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Settings Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-white/5">
                    <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Visibility</span>
                        {pkg.isPublic ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <Lock className="w-3.5 h-3.5 text-zinc-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => handleUpdateStatus({ isPublic: !pkg.isPublic })}
                          className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${pkg.isPublic ? 'bg-blue-600' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${pkg.isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{pkg.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Status</span>
                        {getStatusBadge(pkg.status)}
                      </div>
                      <select
                        value={pkg.status}
                        onChange={(e) => handleUpdateStatus({ status: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg text-xs text-white p-2 font-mono uppercase focus:outline-none focus:border-primary/50"
                      >
                        <option value="draft">Draft</option>
                        <option value="in_development">In Dev</option>
                        <option value="in_review">In Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {manifest ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1.5 tracking-wider">Engine</span>
                          <div className="text-sm font-mono text-white bg-white/5 inline-block px-2 py-1 rounded-md">
                            {latestVersion?.engineVersion || 'N/A'}
                          </div>
                        </div>
                        <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1.5 tracking-wider">Runner</span>
                          <div className="text-sm font-mono text-white bg-white/5 inline-block px-2 py-1 rounded-md">
                            {manifest.runner || 'default'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Modules</span>
                        <div className="flex flex-wrap gap-2">
                          {manifest.modules?.map((m: any, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5 px-3 py-1.5 rounded-lg transition-colors">
                              {m.title || m.slug}
                            </Badge>
                          )) || <span className="text-muted-foreground italic text-sm">No modules defined</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground italic text-sm">No manifest data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COL: History */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/30 border-white/5 rounded-3xl h-full backdrop-blur-sm flex flex-col">
              <CardHeader className="bg-white/2 border-b border-white/5 py-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Version History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {pkg.versions?.map((v: any, i: number) => (
                    <div key={v.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />
                        <div>
                          <div className={`font-bold font-mono text-sm ${i === 0 ? 'text-white' : 'text-muted-foreground group-hover:text-zinc-300'}`}>v{v.version}</div>
                          <div className="text-[10px] text-zinc-600 mt-0.5">{new Date(v.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-white/5 bg-black/20 text-zinc-500 font-mono">
                        {v.sizeBytes ? Math.round(v.sizeBytes / 1024) + ' KB' : 'N/A'}
                      </Badge>
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
