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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@progy/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@progy/ui/tooltip';

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
  const { listPackages, updatePackage, deletePackage } = useDashboard(
    session?.session.token,
  );

  const handleUpdateStatus = async (pkgId: string, status: string) => {
    try {
      await updatePackage.mutateAsync({ pkgId, data: { status: status as any } });
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
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[9px] font-black tracking-wider px-2 py-0.5 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]">
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge
            variant="outline"
            className="text-zinc-500 border-zinc-500/20 uppercase text-[9px] font-black tracking-wider px-2 py-0.5"
          >
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge
            variant="outline"
            className="text-orange-400 border-orange-500/20 uppercase text-[9px] font-black tracking-wider px-2 py-0.5"
          >
            Archived
          </Badge>
        );
      case 'in_review':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 uppercase text-[9px] font-black tracking-wider px-2 py-0.5">
            In Review
          </Badge>
        );
      case 'in_development':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20 uppercase text-[9px] font-black tracking-wider px-2 py-0.5">
            In Dev
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/20 uppercase text-[9px] font-black tracking-wider px-2 py-0.5">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="uppercase text-[9px] font-black tracking-wider px-2 py-0.5">
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
      <div className="text-center py-20 bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-white/5 border-dashed">
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
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          My Published Packages
        </h2>
      </div>

      <div className="rounded-3xl border border-white/5 overflow-hidden bg-zinc-900/20 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="w-[300px] text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4 pl-6">
                Package
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Status
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Security
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Updated
              </TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-zinc-500 pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow
                key={pkg.id}
                className="border-white/5 hover:bg-white/5 transition-colors group"
              >
                <TableCell className="font-medium py-5 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950/50 border border-white/10 flex items-center justify-center group-hover:border-primary/20 transition-colors">
                      <Package className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors tracking-tight truncate max-w-[200px]" title={pkg.name}>
                        {pkg.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        v{pkg.latestVersion || '0.0.0'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                <TableCell>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        {pkg.guard ? (
                          pkg.guard.passed ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
                              <Check className="w-3 h-3" />
                              <span className="text-[9px] font-black uppercase tracking-wider">
                                Pass
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-colors cursor-help">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-[9px] font-black uppercase tracking-wider">
                                Fail
                              </span>
                            </div>
                          )
                        ) : (
                          <span className="text-zinc-600 text-[10px] font-mono">
                            -
                          </span>
                        )}
                      </TooltipTrigger>
                      {pkg.guard && !pkg.guard.passed && (
                        <TooltipContent className="bg-black/90 backdrop-blur-xl border-red-900/30 text-red-200 text-xs p-4 rounded-xl max-w-xs leading-relaxed shadow-2xl">
                          <p>
                            <span className="font-black text-red-400 block mb-1 uppercase text-[9px] tracking-widest">
                              Security Alert
                            </span>
                            {pkg.guard.reason}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-zinc-400 text-xs font-medium">
                  {new Date(pkg.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-950/95 backdrop-blur-xl border-white/10 rounded-2xl w-52 p-2 shadow-2xl shadow-black"
                    >
                      <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest italic opacity-40 px-2 py-1.5">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="text-[11px] font-bold uppercase tracking-wide rounded-lg focus:bg-white/10 px-2 py-2 cursor-pointer mb-1 text-zinc-300 focus:text-white"
                        onClick={() =>
                          router.push(`/dashboard/packages/${pkg.id}`)
                        }
                      >
                        <Package className="w-3.5 h-3.5 mr-2 text-primary" />
                        Manage Details
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-white/5 my-1" />

                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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
                              onClick={() => handleDeletePackage(pkg.id)}
                              disabled={deletePackage.isPending}
                            >
                              {deletePackage.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
