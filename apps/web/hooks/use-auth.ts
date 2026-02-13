import { authClient } from '@/lib/auth-client';

export const useAuth = () => {
  const session = authClient.useSession();

  const userPlan = session.data?.user?.subscription || 'free';
  const isPro = userPlan === 'pro';
  // @ts-ignore
  const isLifetime = session.data?.user?.hasLifetime || userPlan === 'lifetime';
  const isDual = isLifetime && isPro;

  const planLabel = isDual
    ? 'LIFETIME + PRO'
    : isLifetime
      ? 'LIFETIME ACCESS'
      : isPro
        ? 'PRO MEMBERSHIP'
        : 'COMMUNITY';

  const signIn = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: window.location.origin + '/dashboard',
    });
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  return {
    session: session.data,
    isPending: session.isPending,
    user: session.data?.user,
    token: session.data?.session?.token,
    userPlan,
    isPro,
    isLifetime,
    isDual,
    planLabel,
    signIn,
    signOut,
  };
};
