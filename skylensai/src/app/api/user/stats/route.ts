/**
 * User Statistics API Endpoint
 * Returns user activity and usage statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user creation date for account age calculation
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get log files count
    const logFilesCount = await db.logFile.count({
      where: { userId },
    });

    // Get analysis results count
    const analysisResultsCount = await db.analysisResult.count({
      where: { userId },
    });

    // Calculate total storage used (sum of file sizes)
    const storageResult = await db.logFile.aggregate({
      where: { userId },
      _sum: {
        fileSize: true,
      },
    });

    const totalStorageUsed = storageResult._sum.fileSize || 0;

    const stats = {
      logFilesCount,
      analysisResultsCount,
      totalStorageUsed,
      accountAge,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}