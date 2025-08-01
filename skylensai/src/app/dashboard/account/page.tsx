/**
 * Account Management Page
 * Displays user account information and settings
 */

'use client';

import { useUserSession } from '@/hooks/use-user-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LogoutButton from '@/components/auth/logout-button';
import AuthGuard from '@/components/auth/auth-guard';
import { User, Calendar, Package, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserStats {
  logFilesCount: number;
  analysisResultsCount: number;
  totalStorageUsed: number;
  accountAge: number;
}

export default function AccountPage() {
  const { user, isLoading } = useUserSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return 'bg-blue-100 text-blue-800';
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAccountAge = (days: number) => {
    if (days < 1) return 'Less than a day';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your basic account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : user ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900 mt-1">{user.name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <p className="text-gray-900 mt-1">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-xs text-gray-600 mt-1 font-mono">{user.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subscription Tier</label>
                    <div className="mt-1">
                      <Badge className={getSubscriptionColor(user.subscriptionTier)}>
                        {user.subscriptionTier}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Account Statistics
              </CardTitle>
              <CardDescription>
                Your usage and activity summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : userStats ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Log Files Uploaded</span>
                    <span className="text-gray-900">{userStats.logFilesCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Analysis Results</span>
                    <span className="text-gray-900">{userStats.analysisResultsCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Storage Used</span>
                    <span className="text-gray-900">{formatBytes(userStats.totalStorageUsed)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Account Age</span>
                    <span className="text-gray-900">{formatAccountAge(userStats.accountAge)}</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Unable to load statistics</p>
              )}
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Current Plan: {user?.subscriptionTier || 'FREE'}</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {user?.subscriptionTier === 'FREE' 
                    ? 'Upgrade to unlock premium AI analysis features'
                    : 'Thanks for being a premium subscriber!'
                  }
                </p>
              </div>
              
              {user?.subscriptionTier === 'FREE' && (
                <Button className="w-full" variant="outline">
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Actions
              </CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
              
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              
              <Button variant="outline" className="w-full">
                Download Data
              </Button>
              
              <div className="pt-4 border-t">
                <LogoutButton 
                  variant="destructive" 
                  className="w-full"
                  showIcon={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}