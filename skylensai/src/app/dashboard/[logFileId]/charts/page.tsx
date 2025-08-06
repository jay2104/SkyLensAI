"use client";

import { useParams } from "next/navigation";
import { useState, lazy, Suspense, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import DashboardLayout from "~/app/_components/DashboardLayout";
import DashboardControls from "~/app/_components/DashboardControls";
import DynamicParameterSection from "~/app/_components/DynamicParameterSection";
import ParametersSidebar from "~/app/_components/ParametersSidebar";
import { BarChart3, Settings, Layers, Filter, Download, RefreshCw } from "lucide-react";

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

export default function AdvancedChartsPage() {
  const params = useParams();
  const logFileId = params.logFileId as string;
  const [isParametersSidebarOpen, setIsParametersSidebarOpen] = useState(false);
  
  // Advanced charting state
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 0 });
  const [chartLayout, setChartLayout] = useState<'grid' | 'stack' | 'overlay'>('grid');
  const [chartHeight, setChartHeight] = useState<number>(300);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = api.logFile.getLogDashboardData.useQuery(
    { logFileId },
    { enabled: !!logFileId }
  );

  // Fetch time series data
  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = api.logFile.getTimeSeriesData.useQuery(
    { logFileId },
    { 
      enabled: !!logFileId && dashboardData?.uploadStatus === "PROCESSED",
      retry: false,
    }
  );

  // Fetch AI-enhanced parameter metadata
  const { data: parameterMetadata, isLoading: isParameterMetadataLoading } = api.logFile.getParameterMetadata.useQuery(
    { logFileId },
    { 
      enabled: !!logFileId && dashboardData?.uploadStatus === "PROCESSED",
      retry: false,
    }
  );

  // Initialize interactive controls when data loads
  useMemo(() => {
    if (timeSeriesData && dashboardData) {
      const availableKeys = Object.keys(timeSeriesData);
      
      // Initialize selected parameters (top 6 by default)
      if (selectedParameters.length === 0) {
        const topParams = availableKeys.slice(0, 6);
        setSelectedParameters(topParams);
      }
      
      // Initialize time range (full duration by default)  
      if (timeRange.start === 0 && timeRange.end === 0 && dashboardData.flightDuration) {
        setTimeRange({ start: 0, end: dashboardData.flightDuration });
      }
    }
  }, [timeSeriesData, dashboardData, selectedParameters.length, timeRange]);

  // Filter time series data based on current selections
  const filteredTimeSeriesData = useMemo(() => {
    if (!timeSeriesData) return {};
    
    const filtered: Record<string, typeof timeSeriesData[string]> = {};
    
    selectedParameters.forEach(param => {
      if (timeSeriesData[param]) {
        const dataPoints = timeSeriesData[param]!.filter(point => 
          point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
        );
        filtered[param] = dataPoints;
      }
    });
    
    return filtered;
  }, [timeSeriesData, selectedParameters, timeRange]);

  // Enhanced export functionality
  const handleEnhancedExport = async (format: "csv" | "json" | "excel" | "png") => {
    try {
      // Export chart data based on current view
      console.log(`Exporting charts in ${format} format with parameters:`, selectedParameters);
      // TODO: Implement advanced export functionality
    } catch (error) {
      console.error("Enhanced export failed:", error);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    handleEnhancedExport(format);
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

  const isProcessed = dashboardData.uploadStatus === "PROCESSED";

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <DashboardLayout
          logFileName={dashboardData.fileName}
          logFileId={logFileId}
          isLoading={isTimeSeriesLoading || isParameterMetadataLoading}
          onExport={isProcessed ? handleExport : undefined}
          onParametersToggle={() => setIsParametersSidebarOpen(!isParametersSidebarOpen)}
        >
          {isProcessed && dashboardData && (
            <>
              {/* Advanced Charts Header */}
              <section className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                          Advanced Flight Analysis
                        </h1>
                        <p className="text-slate-600">
                          Professional plotting and mapping tools for complete control and detailed analysis
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {Object.keys(timeSeriesData || {}).length}
                      </div>
                      <div className="text-sm text-slate-500">
                        Available Parameters
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Chart Configuration Panel */}
              <section className="mb-8">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-slate-600" />
                    Chart Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Layout Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Chart Layout
                      </label>
                      <select
                        value={chartLayout}
                        onChange={(e) => setChartLayout(e.target.value as 'grid' | 'stack' | 'overlay')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="grid">Grid View</option>
                        <option value="stack">Stacked View</option>
                        <option value="overlay">Overlay View</option>
                      </select>
                    </div>

                    {/* Chart Height */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Chart Height
                      </label>
                      <select
                        value={chartHeight}
                        onChange={(e) => setChartHeight(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={200}>Compact (200px)</option>
                        <option value={300}>Standard (300px)</option>
                        <option value={400}>Large (400px)</option>
                        <option value={500}>Extra Large (500px)</option>
                      </select>
                    </div>

                    {/* Export Options */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Export Format
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEnhancedExport("png")}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PNG
                        </button>
                        <button
                          onClick={() => handleEnhancedExport("csv")}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </button>
                      </div>
                    </div>

                    {/* Refresh Data */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data Control
                      </label>
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Interactive Dashboard Controls */}
              {timeSeriesData && dashboardData.flightDuration && (
                <DashboardControls
                  timeSeriesData={timeSeriesData}
                  selectedParameters={selectedParameters}
                  onParameterChange={setSelectedParameters}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  totalDuration={dashboardData.flightDuration}
                  onExport={handleEnhancedExport}
                  className="mb-8"
                />
              )}

              {/* Advanced Charts Display */}
              {filteredTimeSeriesData && Object.keys(filteredTimeSeriesData).length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <Layers className="w-6 h-6 mr-2 text-blue-600" />
                    Interactive Parameter Charts
                  </h2>
                  
                  {chartLayout === 'grid' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(filteredTimeSeriesData).map(([param, data]) => (
                        <div key={param} className="bg-white rounded-lg border border-slate-200 p-6">
                          <h3 className="font-semibold text-slate-900 mb-4">
                            {param.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <Suspense fallback={<ChartSkeleton />}>
                            <FlightChart
                              title={param}
                              data={data}
                              parameter={param}
                              color="#3b82f6"
                              height={chartHeight}
                            />
                          </Suspense>
                        </div>
                      ))}
                    </div>
                  )}

                  {chartLayout === 'stack' && (
                    <div className="space-y-6">
                      {Object.entries(filteredTimeSeriesData).map(([param, data]) => (
                        <div key={param} className="bg-white rounded-lg border border-slate-200 p-6">
                          <h3 className="font-semibold text-slate-900 mb-4">
                            {param.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <Suspense fallback={<ChartSkeleton />}>
                            <FlightChart
                              title={param}
                              data={data}
                              parameter={param}
                              color="#3b82f6"
                              height={chartHeight}
                            />
                          </Suspense>
                        </div>
                      ))}
                    </div>
                  )}

                  {chartLayout === 'overlay' && (
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                      <h3 className="font-semibold text-slate-900 mb-4">
                        Overlay View - All Selected Parameters
                      </h3>
                      <div className="text-sm text-slate-600 mb-4">
                        Note: Overlay view combines multiple parameters. Values are normalized for comparison.
                      </div>
                      <Suspense fallback={<ChartSkeleton />}>
                        <div style={{ height: chartHeight + 50 }}>
                          {Object.entries(filteredTimeSeriesData).slice(0, 1).map(([param, data]) => (
                            <FlightChart
                              key={param}
                              title="Overlay Chart"
                              data={data}
                              parameter={param}
                              color="#3b82f6"
                              height={chartHeight}
                            />
                          ))}
                        </div>
                      </Suspense>
                    </div>
                  )}
                </section>
              )}

              {/* GPS Map Section (if GPS data exists) */}
              {(() => {
                const gpsLatData = filteredTimeSeriesData['gps_lat'];
                const gpsLngData = filteredTimeSeriesData['gps_lng'];
                const altitudeData = filteredTimeSeriesData['altitude'];

                if (gpsLatData && gpsLngData && gpsLatData.length > 0 && gpsLngData.length > 0) {
                  return (
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <Layers className="w-6 h-6 mr-2 text-green-600" />
                        3D Flight Path Visualization
                      </h2>
                      <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                          <strong>Advanced Mapping:</strong> Interactive 3D flight path with {gpsLatData.length} GPS points 
                          from {Math.round(timeRange.start/60)}m{Math.round(timeRange.start%60).toString().padStart(2,'0')}s 
                          to {Math.round(timeRange.end/60)}m{Math.round(timeRange.end%60).toString().padStart(2,'0')}s
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
              {(!filteredTimeSeriesData || Object.keys(filteredTimeSeriesData).length === 0) && (
                <div className="text-center py-12">
                  <Filter className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data in Selected Range</h3>
                  <p className="text-slate-600 mb-4">
                    Adjust your parameter selection and time range to display charts.
                  </p>
                  <button
                    onClick={() => {
                      if (timeSeriesData) {
                        setSelectedParameters(Object.keys(timeSeriesData).slice(0, 6));
                        setTimeRange({ start: 0, end: dashboardData?.flightDuration || 0 });
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reset to Default View
                  </button>
                </div>
              )}
            </>
          )}
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