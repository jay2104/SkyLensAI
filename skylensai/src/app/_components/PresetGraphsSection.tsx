"use client";

import { Suspense } from "react";
import { BarChart3, TrendingUp, Battery, Navigation, Settings, AlertTriangle, Cpu, Zap } from "lucide-react";
import FlightChart from "./FlightChart";

// Define preset graph configurations
interface PresetGraph {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  parameters: string[];
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  priority: number;
  category: 'critical' | 'monitoring' | 'analysis';
  colors: string[];
}

const PRESET_GRAPHS: PresetGraph[] = [
  {
    id: 'altitude-profile',
    title: 'Altitude Profile',
    description: 'Flight altitude over time - essential safety metric',
    icon: TrendingUp,
    parameters: ['altitude', 'gps_alt'],
    chartType: 'area',
    priority: 1,
    category: 'critical',
    colors: ['#10b981', '#047857']
  },
  {
    id: 'attitude-control',
    title: 'Attitude Control',
    description: 'Roll, pitch, yaw stability analysis',
    icon: Navigation,
    parameters: ['roll', 'pitch', 'yaw'],
    chartType: 'line',
    priority: 1,
    category: 'critical',
    colors: ['#3b82f6', '#1d4ed8', '#1e40af']
  },
  {
    id: 'battery-performance',
    title: 'Battery Performance',
    description: 'Power system health and consumption',
    icon: Battery,
    parameters: ['battery_voltage', 'battery_current'],
    chartType: 'line',
    priority: 1,
    category: 'critical',
    colors: ['#f59e0b', '#d97706']
  },
  {
    id: 'gps-quality',
    title: 'GPS Quality',
    description: 'Navigation accuracy and satellite health',
    icon: Navigation,
    parameters: ['gps_hdop', 'gps_vdop'],
    chartType: 'line',
    priority: 2,
    category: 'monitoring',
    colors: ['#34d399', '#6ee7b7']
  },
  {
    id: 'motor-balance',
    title: 'Motor Output Balance',
    description: 'Propulsion system symmetry analysis',
    icon: Settings,
    parameters: ['motor_1', 'motor_2', 'motor_3', 'motor_4'],
    chartType: 'line',
    priority: 2,
    category: 'monitoring',
    colors: ['#f97316', '#ea580c', '#dc2626', '#b91c1c']
  },
  {
    id: 'control-response',
    title: 'Control Response',
    description: 'Input vs output response analysis',
    icon: Settings,
    parameters: ['rc_throttle', 'rc_roll', 'rc_pitch'],
    chartType: 'line',
    priority: 2,
    category: 'analysis',
    colors: ['#8b5cf6', '#7c3aed', '#6d28d9']
  },
  {
    id: 'vibration-health',
    title: 'Vibration Analysis',
    description: 'Mechanical health and stability indicators',
    icon: AlertTriangle,
    parameters: ['vibration_x', 'vibration_y', 'vibration_z'],
    chartType: 'line',
    priority: 2,
    category: 'monitoring',
    colors: ['#dc2626', '#b91c1c', '#991b1b']
  },
  {
    id: 'system-performance',
    title: 'System Performance',
    description: 'Flight controller load and efficiency',
    icon: Cpu,
    parameters: ['cpu_load', 'memory_usage'],
    chartType: 'line',
    priority: 3,
    category: 'analysis',
    colors: ['#84cc16', '#65a30d']
  }
];

// Chart skeleton for loading states
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded"></div>
            <div>
              <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-48"></div>
            </div>
          </div>
        </div>
        <div className="h-64 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
}

interface PresetGraphsSectionProps {
  timeSeriesData: Record<string, any[]>;
  className?: string;
}

export default function PresetGraphsSection({ timeSeriesData, className = "" }: PresetGraphsSectionProps) {
  // Filter presets to only show those with available data
  const availablePresets = PRESET_GRAPHS.filter(preset => 
    preset.parameters.some(param => timeSeriesData[param] && timeSeriesData[param].length > 0)
  );

  // Sort by priority and take top 8 presets
  const topPresets = availablePresets
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 8);

  const getCategoryStyle = (category: PresetGraph['category']) => {
    switch (category) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'monitoring':
        return 'border-yellow-200 bg-yellow-50';
      case 'analysis':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getCategoryBadge = (category: PresetGraph['category']) => {
    switch (category) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800';
      case 'analysis':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (topPresets.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Available</h3>
        <p className="text-slate-600">
          No compatible parameters found in your log file for preset graphs.
        </p>
      </div>
    );
  }

  return (
    <section className={className}>
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Flight Analysis Highlights</h2>
            <p className="text-slate-600">
              Key insights from the most commonly analyzed flight parameters ({topPresets.length} preset graphs)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {topPresets.length}
            </div>
            <div className="text-sm text-slate-500">
              Key Metrics
            </div>
          </div>
        </div>
      </div>

      {/* Preset Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topPresets.map((preset) => {
          const Icon = preset.icon;
          
          // Get data for available parameters only
          const availableParams = preset.parameters.filter(param => 
            timeSeriesData[param] && timeSeriesData[param].length > 0
          );
          
          if (availableParams.length === 0) return null;

          return (
            <div
              key={preset.id}
              className={`bg-white rounded-lg border-2 transition-all hover:shadow-md ${getCategoryStyle(preset.category)}`}
            >
              {/* Chart Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{preset.title}</h3>
                      <p className="text-sm text-slate-600">{preset.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(preset.category)}`}>
                    {preset.category.toUpperCase()}
                  </span>
                </div>
                
                {/* Parameter Count */}
                <div className="text-xs text-slate-500">
                  Showing {availableParams.length} of {preset.parameters.length} parameters
                </div>
              </div>

              {/* Chart Content */}
              <div className="px-6 pb-6">
                <Suspense fallback={<ChartSkeleton />}>
                  {availableParams.length === 1 ? (
                    // Single parameter chart
                    <FlightChart
                      title={preset.title}
                      data={timeSeriesData[availableParams[0]!] || []}
                      parameter={availableParams[0]!}
                      color={preset.colors[0] || '#3b82f6'}
                      height={200}
                    />
                  ) : (
                    // Multi-parameter chart
                    <div className="space-y-3">
                      {availableParams.map((param, index) => (
                        <FlightChart
                          key={param}
                          title={param.replace(/_/g, ' ').toUpperCase()}
                          data={timeSeriesData[param] || []}
                          parameter={param}
                          color={preset.colors[index] || '#3b82f6'}
                          height={120}
                        />
                      ))}
                    </div>
                  )}
                </Suspense>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">About Preset Graphs</h4>
        </div>
        <p className="text-sm text-blue-700">
          These preset graphs show the most commonly analyzed parameters from ArduPilot UAV Log Viewer. 
          They provide quick insights into flight safety, performance, and system health. 
          For advanced plotting and custom analysis, use the <strong>Charts</strong> menu for full control.
        </p>
      </div>
    </section>
  );
}