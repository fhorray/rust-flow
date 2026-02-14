'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@progy/ui/card';
import { Button } from '@progy/ui/button';
import { Badge } from '@progy/ui/badge';
import {
  Loader2,
  Trash2,
  ExternalLink,
  Globe,
  Lock,
  Package,
  MoreHorizontal,
  Check,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Box,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@progy/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@progy/ui/dialog';

type RegistryPackage = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status:
  | 'draft'
  | 'published'
  | 'archived'
  | 'deleted'
  | 'in_review'
  | 'rejected'
  | 'banned'
  | 'in_development';
  latestVersion: string | null;
  isPublic: boolean;
  guard?: { passed: boolean; reason: string } | null;
  updatedAt: string;
};

import { useDashboard } from '@/hooks/use-dashboard';

export function PackagesTab({ session }: { session: any }) {
  const router = useRouter();
  const { listPackages, updatePackageStatus, deletePackage } = useDashboard(
    session?.session.token,
  );

  const handleUpdateStatus = async (pkgId: string, status: string) => {
    try {
      await updatePackageStatus.mutateAsync({ pkgId, status });
      toast.success(`Status updated to ${status}`);
    } catch (e: any) {
      toast.error(e.message || 'Error updating status');
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    try {
      await deletePackage.mutateAsync(pkgId);
      toast.success('Package deleted successfully');
    } catch (e: any) {
      toast.error(e.message || 'Error deleting package');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/20 uppercase text-[8px] font-black">
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge
            variant="outline"
            className="text-zinc-400 border-zinc-500/20 uppercase text-[8px] font-black"
          >
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge
            variant="outline"
            className="text-orange-400 border-orange-500/20 uppercase text-[8px] font-black"
          >
            Archived
          </Badge>
        );
      case 'in_review':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 uppercase text-[8px] font-black">
            In Review
          </Badge>
        );
      case 'in_development':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20 uppercase text-[8px] font-black">
            In Dev
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/20 uppercase text-[8px] font-black">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="uppercase text-[8px] font-black">
            {status}
          </Badge>
        );
    }
  };

  if (listPackages.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest italic">
          Syncing Registry...
        </p>
      </div>
    );
  }

  const packages = listPackages.data || [];

  if (packages.length === 0) {
    return (
      <div className="text-center py-20 bg-white/2 backdrop-blur-sm rounded-3xl border border-white/5 border-dashed">
        <Package className="w-12 h-12 text-white/5 mx-auto mb-5" />
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
          No Packages Found
        </h3>
        <p className="text-[10px] text-muted-foreground/40 mb-8 max-w-xs mx-auto italic leading-relaxed">
          You haven't published any courses yet. Use `progy publish` from your
          terminal to share your knowledge with the world.
        </p>
        <Button
          variant="outline"
          onClick={() => listPackages.refetch()}
          className="h-10 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest group"
        >
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
          <Card
            key={pkg.id}
            className="bg-white/5 border-white/5 rounded-3xl overflow-hidden group hover:bg-white/10 transition-colors p-1"
          >
            <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <CardTitle className="font-black text-sm tracking-tight text-white uppercase italic">
                    {pkg.name}
                  </CardTitle>
                  {getStatusBadge(pkg.status)}
                  {!pkg.isPublic && (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="text-[10px] italic font-medium opacity-60">
                  {pkg.latestVersion
                    ? `Version ${pkg.latestVersion}`
                    : 'No versions published'}{' '}
                  • Updated {new Date(pkg.updatedAt).toLocaleDateString()}
                </CardDescription>

                {pkg.guard && !pkg.guard.passed && (
                  <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[10px] font-black uppercase text-red-400">AI Guard Feedback</span>
                    </div>
                    <p className="text-[11px] text-red-200/70 italic leading-relaxed">
                      {pkg.guard.reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl hover:bg-white/10"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-zinc-950 border-white/10 rounded-2xl w-48 p-2"
                  >
                    <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest italic opacity-50 px-2 py-1">
                      Direct Actions
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                      className="text-[11px] font-bold uppercase italic rounded-lg focus:bg-white/5 px-2 cursor-pointer"
                      onClick={() => router.push(`/dashboard/packages/${pkg.id}`)}
                    >
                      <Package className="w-3.5 h-3.5 mr-2 text-primary" />{' '}
                      Manage Details
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/5 my-2" />

                    <DropdownMenuItem
                      className="text-[11px] font-bold uppercase italic rounded-lg focus:bg-white/5 px-2"
                      disabled={updatePackageStatus.isPending}
                      onClick={() => handleUpdateStatus(pkg.id, 'published')}
                    >
                      <Globe className="w-3.5 h-3.5 mr-2 text-green-500" />{' '}
                      Published
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-[11px] font-bold uppercase italic rounded-lg focus:bg-white/5 px-2"
                      disabled={updatePackageStatus.isPending}
                      onClick={() => handleUpdateStatus(pkg.id, 'draft')}
                    >
                      <Package className="w-3.5 h-3.5 mr-2 text-zinc-500" />{' '}
                      Mark as Draft
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-[11px] font-bold uppercase italic rounded-lg focus:bg-white/5 px-2"
                      disabled={updatePackageStatus.isPending}
                      onClick={() => handleUpdateStatus(pkg.id, 'archived')}
                    >
                      <Box className="w-3.5 h-3.5 mr-2 text-orange-500" />{' '}
                      Archive
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/5 my-2" />

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="w-full flex items-center px-2 py-1.5 text-[11px] font-bold uppercase italic text-destructive hover:bg-destructive/10 outline-none rounded-lg transition-colors text-left">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Package
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-white/10 rounded-[2rem] sm:max-w-[400px] p-8 shadow-2xl shadow-black">
                        <DialogHeader>
                          <DialogTitle className="text-white uppercase font-black italic tracking-tight flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            Confirm Permanent Deletion
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground/60 text-[11px] italic leading-relaxed pt-2">
                            This action is <span className="text-destructive font-black">irreversible</span>.
                            By deleting <strong>{pkg.name}</strong>, all associated versions
                            and artifacts will be wiped from the registry.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8">
                          <Button
                            variant="destructive"
                            size="lg"
                            onClick={() => handleDeletePackage(pkg.id)}
                            disabled={deletePackage.isPending}
                            className="w-full uppercase font-black text-[11px] tracking-[0.2em] rounded-2xl h-14 px-8 shadow-xl shadow-destructive/20 active:scale-95 transition-all"
                          >
                            {deletePackage.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Execute Deletion'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>

                {pkg.status === 'published' && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-9 px-4 border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-black/20 transition-all active:scale-95"
                  >
                    <a
                      href={`/courses/${pkg.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
