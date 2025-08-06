"use client";

import { useParams } from "next/navigation";
import { useState, lazy, Suspense, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import DashboardLayout from "~/app/_components/DashboardLayout";
import HealthMetricCard from "~/app/_components/HealthMetricCard";
import AiInsightsCard from "~/app/_components/AiInsightsCard";
import AiPreviewModal from "~/app/_components/AiPreviewModal";
import VirtualExpertPanel from "~/app/_components/VirtualExpertPanel";
import ParameterCategorySection from "~/app/_components/ParameterCategorySection";
import DashboardControls from "~/app/_components/DashboardControls";
import DynamicParameterSection from "~/app/_components/DynamicParameterSection";
import PresetGraphsSection from "~/app/_components/PresetGraphsSection";
import ParametersSidebar from "~/app/_components/ParametersSidebar";
import { type DroneContext } from "~/server/services/openaiService";
import { Activity, Gauge, Settings, BarChart3 } from "lucide-react";

// Lazy load heavy components for better performance
const FlightChart = lazy(() => import("~/app/_components/FlightChart"));
const GpsMap = lazy(() => import("~/app/_components/GpsMap"));

// Loading component for lazy-loaded charts
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-slate-200 rounded mb-4 w-1/3"></div>
        <div className="h-64 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
}

interface TimeRange {
  start: number;
  end: number;
}

export default function DashboardPage() {
  const params = useParams();
  const logFileId = params.logFileId as string;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAiPreviewModal, setShowAiPreviewModal] = useState(false);
  const [isParametersSidebarOpen, setIsParametersSidebarOpen] = useState(false);
  
  // Interactive dashboard state
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 0 });

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, refetch } = api.logFile.getLogDashboardData.useQuery(
    { logFileId },
    { enabled: !!logFileId }
  );

  // Fetch AI insights preview
  const { data: aiInsightsData, isLoading: isAiInsightsLoading, error: aiInsightsError } = api.logFile.getAiInsightsPreview.useQuery(
    { logFileId },
    { 
      enabled: !!logFileId && dashboardData?.uploadStatus === "PROCESSED",
      retry: false,
    }
  );

  // Fetch user AI preferences
  const { data: userAiPreferences, error: preferencesError } = api.logFile.getUserAiPreferences.useQuery(
    undefined,
    {
      retry: false,
    }
  );

  // AI preview mutation
  const generateAiPreview = api.logFile.generateAiPreview.useMutation({
    onSuccess: (data) => {
      console.log("AI Preview generated:", data);
      // TODO: Show preview results in a dedicated component
      // Refetch dashboard data to get updated analysis results
      refetch();
    },
    onError: (error) => {
      console.error("AI Preview failed:", error.message);
      // Don't throw - just log and continue
    },
  });

  // Analytics tracking mutation
  const trackAiEvent = api.logFile.trackAiUpgradeEvent.useMutation();

  // Fetch time series data
  const { data: timeSeriesData, isLoading: isTimeSeriesLoading, error: timeSeriesError } = api.logFile.getTimeSeriesData.useQuery(
    { logFileId },
    { 
      enabled: !!logFileId && dashboardData?.uploadStatus === "PROCESSED",
      retry: false,
    }
  );

  // Debug logging for timeSeriesData
  useEffect(() => {
    console.log("🔍 TimeSeriesData loading state:", isTimeSeriesLoading);
    console.log("🔍 TimeSeriesData error:", timeSeriesError);
    
    if (timeSeriesData) {
      console.log("🔍 Frontend received timeSeriesData:", timeSeriesData);
      console.log("🔍 Data keys:", Object.keys(timeSeriesData || {}));
      console.log("🔍 Data length per key:", Object.entries(timeSeriesData).map(([key, data]) => [key, data?.length]));
      console.log("🔍 Data structure sample:", JSON.stringify(timeSeriesData, null, 2).slice(0, 1000));
    } else {
      console.log("🔍 No timeSeriesData received yet");
    }
  }, [timeSeriesData, timeSeriesError, isTimeSeriesLoading]);

  // Fetch AI-enhanced parameter metadata
  const { data: parameterMetadata, isLoading: isParameterMetadataLoading, error: parameterMetadataError } = api.logFile.getParameterMetadata.useQuery(
    { logFileId },
    { 
      enabled: !!logFileId && dashboardData?.uploadStatus === "PROCESSED",
      retry: false,
    }
  );

  // Process log file mutation
  const processLogFile = api.logFile.processLogFile.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      refetch();
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error("Failed to process log file:", error);
    },
  });

  // Export data functionality
  const exportData = api.logFile.exportData.useQuery(
    { logFileId, format: "csv" },
    { enabled: false }
  );

  // Initialize interactive controls when data loads
  useMemo(() => {
    console.log("🔍 Initialize controls - timeSeriesData:", !!timeSeriesData, "dashboardData:", !!dashboardData);
    console.log("🔍 Current selectedParameters length:", selectedParameters.length);
    console.log("🔍 Current timeRange:", timeRange);
    
    if (timeSeriesData && dashboardData) {
      const availableKeys = Object.keys(timeSeriesData);
      console.log("🔍 Available keys for initialization:", availableKeys);
      
      // Initialize selected parameters (all available by default)
      if (selectedParameters.length === 0) {
        console.log("🔍 Setting initial selectedParameters to:", availableKeys);
        setSelectedParameters(availableKeys);
      }
      
      // Initialize time range (full duration by default)  
      if (timeRange.start === 0 && timeRange.end === 0 && dashboardData.flightDuration) {
        const newTimeRange = { start: 0, end: dashboardData.flightDuration };
        console.log("🔍 Setting initial timeRange to:", newTimeRange);
        setTimeRange(newTimeRange);
      }
    }
  }, [timeSeriesData, dashboardData, selectedParameters.length, timeRange]);

  // Filter time series data based on current selections
  const filteredTimeSeriesData = useMemo(() => {
    console.log("🎯 FILTERING START");
    console.log("🎯 timeSeriesData exists:", !!timeSeriesData);
    console.log("🎯 selectedParameters:", selectedParameters);
    console.log("🎯 timeRange:", timeRange);
    
    if (!timeSeriesData) {
      console.log("🎯 No timeSeriesData available for filtering - returning empty object");
      return {};
    }
    
    const availableKeys = Object.keys(timeSeriesData);
    console.log("🎯 Available data keys:", availableKeys);
    console.log("🎯 Data sample:", Object.entries(timeSeriesData).slice(0, 2).map(([key, data]) => [key, data?.slice(0, 2)]));
    
    const filtered: Record<string, typeof timeSeriesData[string]> = {};
    
    selectedParameters.forEach(param => {
      if (timeSeriesData[param]) {
        const allDataPoints = timeSeriesData[param]!;
        console.log(`🎯 ${param}: ${allDataPoints.length} total points`);
        
        const dataPoints = allDataPoints.filter(point => 
          point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
        );
        filtered[param] = dataPoints;
        console.log(`🎯 ${param}: ${dataPoints.length} points after time filtering (${timeRange.start}-${timeRange.end})`);
      } else {
        console.log(`🎯 Parameter ${param} not found in timeSeriesData`);
      }
    });
    
    console.log("🎯 Final filtered data:", Object.entries(filtered).map(([key, data]) => [key, data?.length]));
    console.log("🎯 FILTERING END");
    return filtered;
  }, [timeSeriesData, selectedParameters, timeRange]);

  // Enhanced export functionality
  const handleEnhancedExport = async (format: "csv" | "json" | "excel") => {
    try {
      // Use existing export but with filtered data context
      const result = await exportData.refetch();
      if (result.data) {
        const blob = new Blob([result.data.data], {
          type: format === "csv" ? "text/csv" : 
               format === "json" ? "application/json" : 
               "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.data.fileName.replace(/\.[^/.]+$/, "")}_filtered_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Enhanced export failed:", error);
    }
  };

  // Create DroneContext for real AI insights
  const droneContext = useMemo((): DroneContext | undefined => {
    if (!dashboardData || dashboardData.uploadStatus !== "PROCESSED") return undefined;
    
    return {
      fileName: dashboardData.fileName,
      fileType: dashboardData.fileName.split('.').pop()?.toUpperCase() || 'BIN',
      flightDuration: dashboardData.flightDuration || null,
      maxAltitude: dashboardData.maxAltitude || null,
      totalDistance: dashboardData.totalDistance || null,
      batteryData: {
        startVoltage: dashboardData.batteryStartVoltage || null,
        endVoltage: dashboardData.batteryEndVoltage || null
      },
      gpsQuality: dashboardData.gpsQuality || null,
      flightModes: dashboardData.flightModes || null,
      existingAnalysis: aiInsightsData || null,
      timeSeriesSample: timeSeriesData ? [
        ...(timeSeriesData.altitude?.slice(0, 3).map((d: any) => ({
          parameter: "Altitude",
          timestamp: new Date(d.timestamp).getTime(),
          value: d.value,
          unit: "m"
        })) || []),
        ...(timeSeriesData.battery_voltage?.slice(0, 3).map((d: any) => ({
          parameter: "Battery Voltage",
          timestamp: new Date(d.timestamp).getTime(),
          value: d.value,
          unit: "V"
        })) || []),
        ...(timeSeriesData.roll?.slice(0, 2).map((d: any) => ({
          parameter: "Roll",
          timestamp: new Date(d.timestamp).getTime(),
          value: d.value,
          unit: "deg"
        })) || []),
        ...(timeSeriesData.gps_lat?.slice(0, 2).map((d: any) => ({
          parameter: "GPS Latitude",
          timestamp: new Date(d.timestamp).getTime(),
          value: d.value,
          unit: "deg"
        })) || [])
      ].slice(0, 10) : []
    };
  }, [dashboardData, aiInsightsData, timeSeriesData]);

  const handleExport = async (format: "csv" | "json") => {
    try {
      const result = await exportData.refetch();
      if (result.data) {
        const blob = new Blob([result.data.data], {
          type: format === "csv" ? "text/csv" : "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleProcessLog = () => {
    setIsProcessing(true);
    processLogFile.mutate({ logFileId });
  };

  if (isDashboardLoading) {
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

  const needsProcessing = dashboardData.uploadStatus === "UPLOADED";
  const isProcessed = dashboardData.uploadStatus === "PROCESSED";

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <DashboardLayout
          logFileName={dashboardData.fileName}
          logFileId={logFileId}
          isLoading={isProcessing || isTimeSeriesLoading || isParameterMetadataLoading}
          onExport={isProcessed ? handleExport : undefined}
          onParametersToggle={() => setIsParametersSidebarOpen(!isParametersSidebarOpen)}
        >
      {needsProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">Ready to Process</h3>
              <p className="text-blue-700 mt-1">
                Your log file has been uploaded successfully. Click to process and generate your dashboard.
              </p>
            </div>
            <button
              onClick={handleProcessLog}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isProcessing ? "Processing..." : "Process Log"}
            </button>
          </div>
        </div>
      )}

      {isProcessed && dashboardData && (
        <>
          {/* Health Metrics Overview */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Flight Health Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <HealthMetricCard
                title="Flight Duration"
                value={dashboardData.flightDuration ? `${Math.round(dashboardData.flightDuration / 60)}m ${Math.round(dashboardData.flightDuration % 60)}s` : "N/A"}
                unit=""
                status="good"
                trend={dashboardData.trends?.duration?.trend || "stable"}
                icon="Clock"
              />
              <HealthMetricCard
                title="Max Altitude"
                value={dashboardData.maxAltitude?.toFixed(1) ?? "N/A"}
                unit="m"
                status="good"
                trend={dashboardData.trends?.altitude?.trend || "stable"}
                icon="TrendingUp"
              />
              <HealthMetricCard
                title="Total Distance"
                value={dashboardData.totalDistance ? (dashboardData.totalDistance / 1000).toFixed(2) : "N/A"}
                unit="km"
                status="good"
                trend={dashboardData.trends?.distance?.trend || "stable"}
                icon="Navigation"
              />
              <HealthMetricCard
                title="Battery Used"
                value={
                  dashboardData.batteryStartVoltage && dashboardData.batteryEndVoltage
                    ? `${((dashboardData.batteryStartVoltage - dashboardData.batteryEndVoltage) / dashboardData.batteryStartVoltage * 100).toFixed(1)}%`
                    : "N/A"
                }
                unit=""
                status={
                  dashboardData.batteryStartVoltage && dashboardData.batteryEndVoltage
                    ? ((dashboardData.batteryStartVoltage - dashboardData.batteryEndVoltage) / dashboardData.batteryStartVoltage * 100) > 80
                      ? "warning"
                      : "good"
                    : "good"
                }
                trend={dashboardData.trends?.battery?.trend || "stable"}
                icon="Battery"
              />
              <HealthMetricCard
                title="GPS Quality"
                value={dashboardData.gpsQuality?.toString() ?? "N/A"}
                unit="%"
                status={
                  dashboardData.gpsQuality
                    ? dashboardData.gpsQuality > 85
                      ? "good"
                      : dashboardData.gpsQuality > 60
                      ? "warning"
                      : "error"
                    : "good"
                }
                trend={dashboardData.trends?.gps?.trend || "stable"}
                icon="Satellite"
              />
              <HealthMetricCard
                title="File Size"
                value={(dashboardData.fileSize / (1024 * 1024)).toFixed(1)}
                unit="MB"
                status="good"
                trend={dashboardData.trends?.fileSize?.trend || "stable"}
                icon="HardDrive"
              />
            </div>
          </section>


          {/* AI Insights Section - HIDDEN */}
          {/* <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">AI-Powered Analysis</h2>
            <AiInsightsCard
              logFileName={dashboardData.fileName}
              isUpgradeUser={userAiPreferences?.subscriptionTier !== "FREE"}
              sampleInsights={aiInsightsError ? [] : aiInsightsData?.insights}
              droneContext={droneContext}
              onUpgradeClick={() => {
                trackAiEvent.mutate({ 
                  event: "upgrade_clicked", 
                  logFileId,
                  metadata: { source: "insights_card" }
                });
                setShowAiPreviewModal(true);
              }}
              onPreviewClick={() => {
                trackAiEvent.mutate({ 
                  event: "preview_clicked", 
                  logFileId,
                  metadata: { source: "insights_card" }
                });
                
                if (userAiPreferences) {
                  if (userAiPreferences.subscriptionTier === "FREE") {
                    if (userAiPreferences.aiPreviewUsed) {
                      setShowAiPreviewModal(true);
                    } else {
                      generateAiPreview.mutate({ logFileId });
                    }
                  } else {
                    // Pro user - show full analysis
                    console.log("Show full AI analysis for pro user");
                  }
                } else {
                  console.log("User preferences not loaded yet");
                }
              }}
              className="mb-8"
            />
          </section> */}

          {/* Virtual Expert Section - HIDDEN */}
          {/* <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Virtual Expert</h2>
            <VirtualExpertPanel
              logFileId={logFileId}
              logFileName={dashboardData.fileName}
              userSubscriptionTier={userAiPreferences?.subscriptionTier || "FREE"}
              onUpgradeClick={() => {
                trackAiEvent.mutate({ 
                  event: "upgrade_clicked", 
                  logFileId,
                  metadata: { source: "virtual_expert_panel" }
                });
                setShowAiPreviewModal(true);
              }}
              className="mb-8"
            />
          </section> */}

          {/* Preset Graphs Section - Main Dashboard Highlights */}
          {timeSeriesData && !timeSeriesError && (
            <PresetGraphsSection
              timeSeriesData={timeSeriesData}
              className="mb-8"
            />
          )}

          {/* Advanced Charts Call-to-Action */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                      Need More Control?
                    </h3>
                    <p className="text-slate-600">
                      Use our advanced Charts tool for custom plotting, parameter selection, and detailed analysis
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={`/dashboard/${logFileId}/charts`}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Open Advanced Charts
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Flight Path Preview (if GPS data exists) */}
          {(() => {
            const gpsLatData = timeSeriesData?.['gps_lat'];
            const gpsLngData = timeSeriesData?.['gps_lng'];
            const altitudeData = timeSeriesData?.['altitude'];

            if (gpsLatData && gpsLngData && gpsLatData.length > 0 && gpsLngData.length > 0) {
              return (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Flight Path Overview</h2>
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                      <strong>Flight Path:</strong> {gpsLatData.length} GPS coordinate points recorded during flight
                    </div>
                    <Suspense fallback={<ChartSkeleton />}>
                      <GpsMap
                        gpsLatData={gpsLatData}
                        gpsLngData={gpsLngData}
                        altitudeData={altitudeData || undefined}
                      />
                    </Suspense>
                  </div>
                </section>
              );
            }
            return null;
          })()}

          {/* No Data Message */}
          {!timeSeriesData && !timeSeriesError && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Flight Data Processing</h3>
              <p className="text-slate-600">
                Your log file is being processed. Flight analysis will appear here once complete.
              </p>
            </div>
          )}
        </>
      )}

      {dashboardData.uploadStatus === "ERROR" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900">Processing Error</h3>
          <p className="text-red-700 mt-1">
            There was an error processing your log file. Please try uploading again or contact support.
          </p>
        </div>
      )}

      {/* AI Preview Modal */}
      <AiPreviewModal
        isOpen={showAiPreviewModal}
        onClose={() => {
          trackAiEvent.mutate({ 
            event: "modal_closed", 
            logFileId,
            metadata: { modal_type: "ai_preview" }
          });
          setShowAiPreviewModal(false);
        }}
        logFileName={dashboardData?.fileName}
        onUpgradeClick={(tier) => {
          trackAiEvent.mutate({ 
            event: "upgrade_clicked", 
            logFileId,
            metadata: { source: "preview_modal", tier }
          });
          // TODO: Implement upgrade flow - redirect to billing/subscription page
          console.log("Upgrade requested for tier:", tier);
          setShowAiPreviewModal(false);
        }}
        onTryPreview={() => {
          trackAiEvent.mutate({ 
            event: "trial_started", 
            logFileId,
            metadata: { source: "preview_modal" }
          });
          
          if (userAiPreferences && !userAiPreferences.aiPreviewUsed) {
            generateAiPreview.mutate({ logFileId });
          }
        }}
      />
        </DashboardLayout>
      </div>

      {/* Parameters Sidebar */}
      <ParametersSidebar
        logFileId={logFileId}
        isOpen={isParametersSidebarOpen}
        onClose={() => setIsParametersSidebarOpen(false)}
      />
    </div>
  );
}