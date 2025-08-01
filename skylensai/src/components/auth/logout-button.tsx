/**
 * Logout Button Component
 * Handles user sign out functionality
 */

'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  onLogout?: () => void;
}

export default function LogoutButton({ 
  variant = 'outline',
  size = 'default',
  className,
  showIcon = true,
  onLogout 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true,
      });
      
      onLogout?.();
    } catch (error) {
      console.error('Logout error:', error);
      // Still try to redirect even if there's an error
      window.location.href = '/auth/signin';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}