/**
 * User Session Hook
 * Provides typed access to user session data
 */

'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  subscriptionTier: string;
}

interface ExtendedSession extends Omit<Session, 'user'> {
  user: ExtendedUser;
}

export function useUserSession() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user as ExtendedUser | undefined,
    session: session as ExtendedSession | null,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && !!session,
    isUnauthenticated: status === 'unauthenticated',
    update,
  };
}

export type { ExtendedUser, ExtendedSession };