"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Eye, EyeOff, ZoomIn, ZoomOut } from "lucide-react";

// Helper function to format values based on decimal places
function formatValue(value: number, decimalPlaces: number = 2): string {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toFixed(decimalPlaces);
}

// Helper function to format timestamp to human-readable time
function formatTimestamp(timestamp: number): string {
  const minutes = Math.floor(timestamp / 60);
  const seconds = (timestamp % 60).toFixed(1);
  return `${minutes}:${seconds.padStart(4, '0')}`;
}

interface DataPoint {
  timestamp: number;
  value: number;
  unit: string;
  parameter?: string;
}

interface FlightChartProps {
  title: string;
  data: DataPoint[];
  parameter: string;
  color: string;
  multiSeries?: boolean;
  height?: number;
  chartType?: 'line' | 'area' | 'bar' | 'scatter';
  decimalPlaces?: number;
  minValue?: number;
  maxValue?: number;
}

const SERIES_COLORS = [
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
];

export default function FlightChart({
  title,
  data,
  parameter,
  color,
  multiSeries = false,
  height = 300,
  chartType = 'line',
  decimalPlaces = 2,
  minValue,
  maxValue,
}: FlightChartProps) {
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set());
  const [zoomDomain, setZoomDomain] = useState<{ x?: [number, number]; y?: [number, number] }>({});

  // Process data for chart display
  const chartData = useMemo(() => {
    if (!multiSeries) {
      return data.map((point) => ({
        timestamp: point.timestamp,
        [parameter]: point.value,
        unit: point.unit,
      }));
    }

    // Group by timestamp for multi-series
    const grouped: Record<number, any> = {};
    data.forEach((point) => {
      const seriesName = point.parameter || parameter;
      if (!grouped[point.timestamp]) {
        grouped[point.timestamp] = { timestamp: point.timestamp };
      }
      grouped[point.timestamp][seriesName] = point.value;
    });

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [data, parameter, multiSeries]);

  // Get unique series names for multi-series charts
  const seriesNames = useMemo(() => {
    if (!multiSeries) return [parameter];
    
    const names = new Set<string>();
    data.forEach((point) => {
      if (point.parameter) names.add(point.parameter);
    });
    return Array.from(names);
  }, [data, parameter, multiSeries]);

  // Initialize visible series
  useMemo(() => {
    setVisibleSeries(new Set(seriesNames));
  }, [seriesNames]);

  const toggleSeries = (seriesName: string) => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(seriesName)) {
      newVisible.delete(seriesName);
    } else {
      newVisible.add(seriesName);
    }
    setVisibleSeries(newVisible);
  };

  // Enhanced value formatting using parameter-specific decimal places
  const formatChartValue = (value: number, unit?: string) => {
    if (typeof value !== "number" || isNaN(value)) return "N/A";
    
    // Use parameter-specific decimal places
    const formatted = formatValue(value, decimalPlaces);
    
    // Add unit suffix if available
    if (unit) {
      // Clean up common unit names
      const unitSuffix = unit === "degrees" ? "°" :
                        unit === "volts" ? "V" :
                        unit === "meters" ? "m" :
                        unit === "PWM" ? "" :
                        unit === "percent" ? "%" :
                        unit === "dimensionless" ? "" :
                        ` ${unit}`;
      return `${formatted}${unitSuffix}`;
    }
    
    return formatted;
  };

  const resetZoom = () => {
    setZoomDomain({});
  };

  const exportChart = async () => {
    // Create CSV data
    const headers = ["timestamp", ...seriesNames];
    const csvRows = [headers.join(",")];
    
    chartData.forEach((row) => {
      const values = [
        row.timestamp,
        ...seriesNames.map(name => row[name] || "")
      ];
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!data.length) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-slate-500">
          <p>No data available for this chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {Object.keys(zoomDomain).length > 0 && (
            <button
              onClick={resetZoom}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={exportChart}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Export data"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Series Toggle (for multi-series charts) */}
      {multiSeries && seriesNames.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {seriesNames.map((name, index) => (
            <button
              key={name}
              onClick={() => toggleSeries(name)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                visibleSeries.has(name)
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
              />
              {visibleSeries.has(name) ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {(() => {
            const chartProps = {
              data: chartData,
              margin: { top: 5, right: 30, left: 20, bottom: 5 }
            };

            const commonElements = (
              <>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTimestamp}
                  stroke="#64748b"
                  fontSize={12}
                  domain={zoomDomain.x || ["dataMin", "dataMax"]}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  domain={zoomDomain.y || (minValue !== undefined && maxValue !== undefined ? [minValue, maxValue] : ["dataMin", "dataMax"])}
                  tickFormatter={(value) => formatChartValue(value, data[0]?.unit)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  labelFormatter={(timestamp) => `Time: ${formatTimestamp(Number(timestamp))}`}
                  formatter={(value: number, name: string) => [
                    formatChartValue(value, data[0]?.unit),
                    name,
                  ]}
                />
                {multiSeries && <Legend />}
              </>
            );

            // Render different chart types based on chartType prop
            switch (chartType) {
              case 'area':
                return (
                  <AreaChart {...chartProps}>
                    {commonElements}
                    {seriesNames.map((name, index) => (
                      visibleSeries.has(name) && (
                        <Area
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={multiSeries ? SERIES_COLORS[index % SERIES_COLORS.length] : color}
                          fill={multiSeries ? SERIES_COLORS[index % SERIES_COLORS.length] : color}
                          fillOpacity={0.3}
                          strokeWidth={2}
                          connectNulls={false}
                        />
                      )
                    ))}
                  </AreaChart>
                );

              case 'bar':
                return (
                  <BarChart {...chartProps}>
                    {commonElements}
                    {seriesNames.map((name, index) => (
                      visibleSeries.has(name) && (
                        <Bar
                          key={name}
                          dataKey={name}
                          fill={multiSeries ? SERIES_COLORS[index % SERIES_COLORS.length] : color}
                          fillOpacity={0.8}
                        />
                      )
                    ))}
                  </BarChart>
                );

              case 'scatter':
                return (
                  <ScatterChart {...chartProps}>
                    {commonElements}
                    {seriesNames.map((name, index) => (
                      visibleSeries.has(name) && (
                        <Scatter
                          key={name}
                          dataKey={name}
                          fill={multiSeries ? SERIES_COLORS[index % SERIES_COLORS.length] : color}
                        />
                      )
                    ))}
                  </ScatterChart>
                );

              case 'line':
              default:
                return (
                  <LineChart {...chartProps}>
                    {commonElements}
                    {seriesNames.map((name, index) => (
                      visibleSeries.has(name) && (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={multiSeries ? SERIES_COLORS[index % SERIES_COLORS.length] : color}
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                        />
                      )
                    ))}
                  </LineChart>
                );
            }
          })()}
        </ResponsiveContainer>
      </div>

      {/* Chart Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Data Points:</span>
            <span className="ml-2 font-medium text-slate-900">{chartData.length}</span>
          </div>
          <div>
            <span className="text-slate-500">Duration:</span>
            <span className="ml-2 font-medium text-slate-900">
              {formatTimestamp(Math.max(...chartData.map(d => d.timestamp)))}
            </span>
          </div>
          {!multiSeries && (
            <>
              <div>
                <span className="text-slate-500">Min:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {formatChartValue(Math.min(...data.map(d => d.value)), data[0]?.unit)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Max:</span>
                <span className="ml-2 font-medium text-slate-900">
                  {formatChartValue(Math.max(...data.map(d => d.value)), data[0]?.unit)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}