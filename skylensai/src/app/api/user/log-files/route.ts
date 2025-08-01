/**
 * User Log Files API Endpoint
 * Returns user's uploaded log files with analysis data
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

    // Get user's log files with analysis results
    const logFiles = await db.logFile.findMany({
      where: { userId },
      include: {
        analysisResult: {
          select: {
            id: true,
            status: true,
            healthScore: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to most recent files
    });

    // Transform data for frontend
    const transformedFiles = logFiles.map(file => ({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      uploadStatus: file.uploadStatus,
      fileSize: file.fileSize,
      createdAt: file.createdAt.toISOString(),
      flightDuration: file.flightDuration,
      maxAltitude: file.maxAltitude,
      analysisResult: file.analysisResult,
    }));

    return NextResponse.json(transformedFiles);

  } catch (error) {
    console.error('User log files error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch log files' },
      { status: 500 }
    );
  }
}