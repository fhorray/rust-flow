import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.progy.dev';

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string;
  latestVersion: string;
  updatedAt: string;
}

interface CourseData {
  name: string;
  scope: string;
  slug: string;
  latest: string;
  description: string;
  manifest: string | null;
  engineVersion?: string | null;
  downloadUrl: string;
}

export const useCourses = (packageName?: string) => {
  const listCourses = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/registry`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = (await res.json()) as { courses: Course[] };
      return data.courses;
    },
  });

  const getCourse = useQuery({
    queryKey: ['course', packageName],
    enabled: !!packageName,
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/registry/resolve/${encodeURIComponent(packageName!)}`,
      );
      if (!res.ok) throw new Error('Course not found in the registry.');
      return (await res.json()) as CourseData;
    },
  });

  return {
    listCourses,
    getCourse,
  };
};
