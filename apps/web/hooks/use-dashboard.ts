import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev';

type CourseProgress = {
  courseId: string;
  data: any;
  updatedAt: string;
};

type RegistryPackage = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived' | 'deleted' | 'in_review' | 'rejected' | 'banned' | 'in_development';
  latestVersion: string | null;
  isPublic: boolean;
  guard?: { passed: boolean; reason: string } | null;
  updatedAt: string;
};


export const useDashboard = (token?: string) => {
  const queryClient = useQueryClient();

  const listProgress = useQuery({
    queryKey: ['progress', token],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/progress/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch progress');
      return (await res.json()) as CourseProgress[];
    },
  });

  const resetCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`${API_URL}/progress/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error('Failed to reset progress');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  const updateUsername = useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch(`${API_URL}/user/update-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to update username');
      return data;
    },
  });

  const listPackages = useQuery({
    queryKey: ['packages', token],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/registry/my-packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch packages');
      const data = (await res.json()) as { packages: RegistryPackage[] };
      return data.packages;
    },
  });

  const updatePackageStatus = useMutation({
    mutationFn: async ({ pkgId, status }: { pkgId: string; status: string }) => {
      const res = await fetch(`${API_URL}/registry/packages/${pkgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (pkgId: string) => {
      const res = await fetch(`${API_URL}/registry/packages/${pkgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete package');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const checkout = useMutation({
    mutationFn: async (plan: 'pro' | 'lifetime') => {
      const res = await fetch(`${API_URL}/billing/checkout?plan=${plan}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to start checkout');
      return (await res.json()) as { url: string };
    },
  });

  type RegistryVersion = {
    id: string;
    version: string;
    createdAt: string;
    sizeBytes: number;
    engineVersion?: string;
    manifest?: any;
    guard?: { passed: boolean; reason: string };
  };

  // ...

  const usePackage = (pkgId: string) =>
    useQuery({
      queryKey: ['package', pkgId, token],
      enabled: !!token && !!pkgId,
      queryFn: async () => {
        const res = await fetch(`${API_URL}/registry/packages/${pkgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch package');
        return (await res.json()) as RegistryPackage & {
          versions: RegistryVersion[];
        };
      },
    });

  return {
    listProgress,
    resetCourse,
    updateUsername,
    listPackages,
    updatePackageStatus,
    deletePackage,
    checkout,
    usePackage,
  };
};
