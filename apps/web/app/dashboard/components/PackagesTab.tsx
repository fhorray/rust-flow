'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Loader2, Trash2, ExternalLink, Globe, Lock, Package, MoreHorizontal, Check, RefreshCw, AlertTriangle, ChevronRight, Box } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'components/ui/dialog';

type RegistryPackage = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived' | 'deleted' | 'in_review' | 'rejected' | 'banned' | 'in_development';
  latestVersion: string | null;
  isPublic: boolean;
  updatedAt: string;
};

export function PackagesTab({ session }: { session: any }) {
  const [packages, setPackages] = useState<RegistryPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev';

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/registry/my-packages`, {
        headers: {
          Authorization: `Bearer ${session?.session.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json() as { packages: RegistryPackage[] };
        setPackages(data.packages);
      }
    } catch (e) {
      toast.error('Failed to fetch packages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchPackages();
  }, [session]);

  const handleUpdateStatus = async (pkgId: string, status: string) => {
    setIsUpdating(pkgId);
    try {
      const res = await fetch(`${API_URL}/registry/packages/${pkgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session.token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        fetchPackages();
      } else {
        toast.error('Failed to update status');
      }
    } catch (e) {
      toast.error('Error updating status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    setIsDeleting(pkgId);
    try {
      const res = await fetch(`${API_URL}/registry/packages/${pkgId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.session.token}`,
        },
      });

      if (res.ok) {
        toast.success('Package deleted successfully');
        fetchPackages();
      } else {
        toast.error('Failed to delete package');
      }
    } catch (e) {
      toast.error('Error deleting package');
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/20 uppercase text-[8px] font-black">Published</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-zinc-400 border-zinc-500/20 uppercase text-[8px] font-black">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-orange-400 border-orange-500/20 uppercase text-[8px] font-black">Archived</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 uppercase text-[8px] font-black">In Review</Badge>;
      case 'in_development':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20 uppercase text-[8px] font-black">In Dev</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[8px] font-black">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest italic">Syncing Registry...</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-20 bg-white/2 backdrop-blur-sm rounded-3xl border border-white/5 border-dashed">
        <Package className="w-12 h-12 text-white/5 mx-auto mb-5" />
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
          No Packages Found
        </h3>
        <p className="text-[10px] text-muted-foreground/40 mb-8 max-w-xs mx-auto italic leading-relaxed">
          You haven't published any courses yet. Use `progy publish` from your terminal to share your knowledge with the world.
        </p>
        <Button variant="outline" onClick={fetchPackages} className="h-10 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest group">
          <RefreshCw className="w-3.5 h-3.5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          Refresh List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          My Published Packages
        </h2>
      </div>

      <div className="grid gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="bg-white/5 border-white/5 rounded-3xl overflow-hidden group hover:bg-white/10 transition-colors p-1">
            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <CardTitle className="font-black text-sm tracking-tight text-white uppercase italic">
                    {pkg.name}
                  </CardTitle>
                  {getStatusBadge(pkg.status)}
                  {!pkg.isPublic && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <CardDescription className="text-[10px] italic font-medium opacity-60">
                  {pkg.latestVersion ? `Version ${pkg.latestVersion}` : 'No versions published'} • Updated {new Date(pkg.updatedAt).toLocaleDateString()}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-white/10">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 rounded-2xl w-48 p-2">
                    <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest italic opacity-50 px-2 py-1">Direct Actions</DropdownMenuLabel>

                    <DropdownMenuItem className="text-[11px] font-bold uppercase italic rounded-lg focus:bg-white/5 px-2" onClick={() => handleUpdateStatus(pkg.id, 'published')}>
                      <Globe className="w-3.5 h-3.5 mr-2 text-green-500" /> Published
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-[11px] font-bold uppercase italic rounded-lg focus:bg-white/5 px-2" onClick={() => handleUpdateStatus(pkg.id, 'draft')}>
                      <Package className="w-3.5 h-3.5 mr-2 text-zinc-500" /> Mark as Draft
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-[11px] font-bold uppercase italic rounded-lg focus:bg-white/5 px-2" onClick={() => handleUpdateStatus(pkg.id, 'archived')}>
                      <Box className="w-3.5 h-3.5 mr-2 text-orange-500" /> Archive
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/5 my-2" />

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="w-full flex items-center px-2 py-1.5 text-[11px] font-bold uppercase italic text-destructive hover:bg-destructive/10 outline-none rounded-lg transition-colors text-left">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Package
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-white/10 rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-white uppercase font-black italic tracking-tight flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            Confirm Deletion
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground text-xs italic leading-relaxed pt-2">
                            This will permanently remove <strong>{pkg.name}</strong> and all its versions. Students will no longer be able to install it.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8 gap-3">
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePackage(pkg.id)} disabled={isDeleting === pkg.id} className="w-full uppercase font-black text-[10px] rounded-xl h-12 px-8">
                            {isDeleting === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Permanent Deletion"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>

                {pkg.status === 'published' && (
                  <Button variant="outline" size="sm" asChild className="h-9 px-4 border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-black/20 transition-all active:scale-95">
                    <a href={`/courses/${pkg.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" /> View
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
