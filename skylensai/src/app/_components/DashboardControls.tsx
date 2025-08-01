"use client";

import { useState, useMemo } from "react";
import { Settings, Filter, Clock, BarChart3, Download, Eye, EyeOff, RefreshCw } from "lucide-react";
import ParameterSelector from "./ParameterSelector";
import TimeRangeFilter from "./TimeRangeFilter";

interface DataPoint {
  timestamp: number;
  value: number;
  unit: string;
  parameter?: string;
}

interface TimeRange {
  start: number;
  end: number;
}

interface DashboardControlsProps {
  timeSeriesData: Record<string, DataPoint[]>;
  selectedParameters: string[];
  onParameterChange: (parameters: string[]) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  totalDuration: number;
  onExport?: (format: "csv" | "json" | "excel") => void;
  className?: string;
}

type ControlPanel = "parameters" | "timeRange" | "export" | null;

export default function DashboardControls({
  timeSeriesData,
  selectedParameters,
  onParameterChange,
  timeRange,
  onTimeRangeChange,
  totalDuration,
  onExport,
  className = ""
}: DashboardControlsProps) {
  const [activePanel, setActivePanel] = useState<ControlPanel>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate statistics
  const totalParameters = Object.keys(timeSeriesData).length;
  const selectedCount = selectedParameters.length;
  const timeRangePercent = ((timeRange.end - timeRange.start) / totalDuration) * 100;
  
  // Filter data based on current time range
  const filteredDataStats = useMemo(() => {
    let totalDataPoints = 0;
    let filteredDataPoints = 0;
    
    Object.values(timeSeriesData).forEach(paramData => {
      totalDataPoints += paramData.length;
      filteredDataPoints += paramData.filter(point => 
        point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
      ).length;
    });
    
    return { totalDataPoints, filteredDataPoints };
  }, [timeSeriesData, timeRange]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePanel = (panel: ControlPanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleExport = (format: "csv" | "json" | "excel") => {
    if (onExport) {
      onExport(format);
    }
    setActivePanel(null);
  };

  const resetFilters = () => {
    onParameterChange(Object.keys(timeSeriesData));
    onTimeRangeChange({ start: 0, end: totalDuration });
    setActivePanel(null);
  };

  return (
    <>
      {/* Control Bar */}
      <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Status Indicators */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">Dashboard Controls</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{selectedCount}/{totalParameters} parameters</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRange.end - timeRange.start)} ({timeRangePercent.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{filteredDataStats.filteredDataPoints.toLocaleString()} data points</span>
                </div>
              </div>
            </div>

            {/* Right Side - Control Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => togglePanel("parameters")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  activePanel === "parameters"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Parameters</span>
                {selectedCount < totalParameters && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {totalParameters - selectedCount} hidden
                  </span>
                )}
              </button>

              <button
                onClick={() => togglePanel("timeRange")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  activePanel === "timeRange"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Time Range</span>
                {timeRangePercent < 99 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {timeRangePercent.toFixed(0)}%
                  </span>
                )}
              </button>

              {onExport && (
                <button
                  onClick={() => togglePanel("export")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    activePanel === "export"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              )}

              <button
                onClick={resetFilters}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reset all filters"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title={isCollapsed ? "Show controls" : "Hide controls"}
              >
                {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Status Bar */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg text-sm">
              <div>
                <div className="font-medium text-slate-900">Active Parameters</div>
                <div className="text-slate-600">{selectedCount} of {totalParameters} selected</div>
              </div>
              <div>
                <div className="font-medium text-slate-900">Time Window</div>
                <div className="text-slate-600">
                  {formatTime(timeRange.start)} - {formatTime(timeRange.end)}
                </div>
              </div>
              <div>
                <div className="font-medium text-slate-900">Data Points</div>
                <div className="text-slate-600">
                  {filteredDataStats.filteredDataPoints.toLocaleString()} filtered
                </div>
              </div>
              <div>
                <div className="font-medium text-slate-900">Coverage</div>
                <div className="text-slate-600">
                  {((filteredDataStats.filteredDataPoints / filteredDataStats.totalDataPoints) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panels */}
      {activePanel === "parameters" && (
        <div className="mt-4">
          <ParameterSelector
            timeSeriesData={timeSeriesData}
            selectedParameters={selectedParameters}
            onParameterChange={onParameterChange}
            onClose={() => setActivePanel(null)}
          />
        </div>
      )}

      {activePanel === "timeRange" && (
        <div className="mt-4">
          <TimeRangeFilter
            totalDuration={totalDuration}
            currentRange={timeRange}
            onRangeChange={onTimeRangeChange}
            className=""
          />
        </div>
      )}

      {activePanel === "export" && (
        <div className="mt-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Download className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900">Export Data</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Export Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>Parameters: {selectedCount} selected</div>
                  <div>Time Range: {formatTime(timeRange.end - timeRange.start)}</div>
                  <div>Data Points: {filteredDataStats.filteredDataPoints.toLocaleString()}</div>
                  <div>File Size: ~{Math.round(filteredDataStats.filteredDataPoints * 0.1 / 1024)}KB</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex items-center justify-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">CSV</div>
                    <div className="text-sm text-slate-500">Comma separated values</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExport("json")}
                  className="flex items-center justify-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">JSON</div>
                    <div className="text-sm text-slate-500">JavaScript object notation</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExport("excel")}
                  className="flex items-center justify-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">Excel</div>
                    <div className="text-sm text-slate-500">Microsoft Excel format</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}