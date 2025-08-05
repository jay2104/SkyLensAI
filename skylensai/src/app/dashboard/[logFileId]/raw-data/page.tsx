"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import DashboardLayout from "~/app/_components/DashboardLayout";
import RawDataViewer from "~/app/_components/RawDataViewer";
import { ArrowLeft, Database } from "lucide-react";
import Link from "next/link";

export default function RawDataPage() {
  const params = useParams();
  const logFileId = params.logFileId as string;

  // Fetch log file info for the header
  const { data: dashboardData, isLoading } = api.logFile.getLogDashboardData.useQuery(
    { logFileId },
    { enabled: !!logFileId }
  );

  if (isLoading) {
    return (
      <DashboardLayout isLoading={true} logFileName="Loading...">
        <div />
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout logFileName="Log Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Log File Not Found</h2>
          <p className="text-slate-600">
            The requested log file could not be found or you don't have access to it.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      logFileName={dashboardData.fileName}
      isLoading={false}
    >
      {/* Header with back button */}
      <div className="mb-6">
        <Link
          href={`/dashboard/${logFileId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Raw Parsed Data</h1>
            <p className="text-slate-600">
              Detailed view of all message types and data extracted from {dashboardData.fileName}
            </p>
          </div>
        </div>
      </div>

      {/* Raw Data Viewer */}
      <RawDataViewer 
        logFileId={logFileId}
        alwaysExpanded={true}
        className="bg-white rounded-lg border border-slate-200 p-6"
      />
    </DashboardLayout>
  );
}