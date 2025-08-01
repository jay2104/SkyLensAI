/**
 * Authentication Guard Component
 * Protects components that require authentication
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/auth/signin',
  fallback,
  requireAuth = true
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (requireAuth && !session) {
      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set('callbackUrl', window.location.pathname);
      router.push(url.toString());
      return;
    }

    if (!requireAuth && session) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router, redirectTo, requireAuth]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show fallback if not authenticated and fallback is provided
  if (requireAuth && !session && fallback) {
    return <>{fallback}</>;
  }

  // Don't render anything if redirecting
  if (requireAuth && !session) {
    return null;
  }

  if (!requireAuth && session) {
    return null;
  }

  return <>{children}</>;
}