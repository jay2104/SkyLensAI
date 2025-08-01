/**
 * Dashboard Page
 * Main dashboard showing user's log files and analysis results
 */

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import DashboardLayout from "~/app/_components/DashboardLayout";
import { InputSelectorWrapper } from "~/app/_components/InputSelectorWrapper";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch user's log files
  const logFiles = await db.logFile.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      analysisResult: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to SkyLensAI Dashboard
          </h1>
          <p className="text-gray-600">
            Upload and analyze your drone log files to get AI-powered insights and recommendations.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upload New Log File
          </h2>
          <InputSelectorWrapper />
        </div>

        {/* Recent Files Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Log Files
          </h2>
          
          {logFiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No log files yet</h3>
              <p className="text-gray-600 mb-4">
                Upload your first drone log file to get started with analysis.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {logFiles.map((logFile) => (
                <div key={logFile.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{logFile.fileName}</h3>
                      <p className="text-sm text-gray-600">
                        {logFile.fileType} • {(logFile.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(logFile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        logFile.uploadStatus === 'PROCESSED' 
                          ? 'bg-green-100 text-green-800'
                          : logFile.uploadStatus === 'ERROR'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {logFile.uploadStatus}
                      </span>
                      {logFile.uploadStatus === 'UPLOADED' && !logFile.analysisResult && (
                        <a
                          href={`/dashboard/${logFile.id}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Process & Analyze
                        </a>
                      )}
                      {logFile.analysisResult && (
                        <a
                          href={`/dashboard/${logFile.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Analysis
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}