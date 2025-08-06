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
    parameters: ['baro_altitude', 'gps_altitude', 'altitude', 'gps_alt'],
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
    parameters: ['ntun_roll', 'ntun_pitch', 'ntun_yaw', 'roll', 'pitch', 'yaw'],
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
    parameters: ['battery_voltage', 'battery_current', 'battery_consumed'],
    chartType: 'line',
    priority: 1,
    category: 'critical',
    colors: ['#f59e0b', '#d97706', '#92400e']
  },
  {
    id: 'gps-quality',
    title: 'GPS Quality',
    description: 'Navigation accuracy and satellite health',
    icon: Navigation,
    parameters: ['gpa_hdop', 'gpa_vdop', 'gps_hdop', 'gps_vdop', 'gps_satellites'],
    chartType: 'line',
    priority: 2,
    category: 'monitoring',
    colors: ['#34d399', '#6ee7b7', '#10b981']
  },
  {
    id: 'motor-balance',
    title: 'Motor Output Balance',
    description: 'Propulsion system symmetry analysis',
    icon: Settings,
    parameters: ['servo_output_1', 'servo_output_2', 'servo_output_3', 'servo_output_4', 'motor_1', 'motor_2', 'motor_3', 'motor_4'],
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
    parameters: ['rc_input_throttle', 'rc_input_roll', 'rc_input_pitch', 'rc_input_yaw', 'rc_throttle', 'rc_roll', 'rc_pitch'],
    chartType: 'line',
    priority: 2,
    category: 'analysis',
    colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6']
  },
  {
    id: 'vibration-health',
    title: 'Vibration Analysis',
    description: 'Mechanical health and stability indicators',
    icon: AlertTriangle,
    parameters: ['vibe_x', 'vibe_y', 'vibe_z', 'vibration_x', 'vibration_y', 'vibration_z'],
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
    parameters: ['pm_load', 'pm_task', 'cpu_load', 'memory_usage'],
    chartType: 'line',
    priority: 2,
    category: 'analysis',
    colors: ['#84cc16', '#65a30d']
  },
  {
    id: 'imu-sensors',
    title: 'IMU Sensor Data',
    description: 'Inertial measurement unit readings',
    icon: Cpu,
    parameters: ['imu_accel_x', 'imu_accel_y', 'imu_accel_z', 'imu_gyro_x', 'imu_gyro_y'],
    chartType: 'line',
    priority: 3,
    category: 'analysis',
    colors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63']
  },
  {
    id: 'magnetometer',
    title: 'Magnetometer Data',
    description: 'Compass and magnetic field measurements',
    icon: Navigation,
    parameters: ['mag_x', 'mag_y', 'mag_z', 'magnetometer_x', 'magnetometer_y', 'magnetometer_z'],
    chartType: 'line',
    priority: 3,
    category: 'analysis',
    colors: ['#06b6d4', '#0891b2', '#0e7490']
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
  // Enhanced debug logging
  const dataKeys = Object.keys(timeSeriesData || {});
  console.log("🔍 PresetGraphsSection DEBUGGING:");
  console.log("🔍 Total available data keys:", dataKeys.length);
  console.log("🔍 Available data keys:", dataKeys);
  console.log("🔍 Data samples:", Object.entries(timeSeriesData || {}).slice(0, 5).map(([key, data]) => [key, `${data?.length || 0} points`]));
  
  // Filter presets to only show those with available data (simplified matching)
  const availablePresets = PRESET_GRAPHS.filter(preset => {
    const hasData = preset.parameters.some(param => {
      const exists = timeSeriesData[param] && timeSeriesData[param].length > 0;
      if (exists) {
        console.log(`✅ Found parameter: ${param} with ${timeSeriesData[param]?.length || 0} points`);
      }
      return exists;
    });
    
    console.log(`${hasData ? '✅' : '❌'} Preset "${preset.title}": ${hasData ? 'AVAILABLE' : 'unavailable'} - checking parameters:`, preset.parameters);
    return hasData;
  });

  // Sort by priority and take more presets
  const topPresets = availablePresets
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 10); // Increased from 8 to 10
    
  console.log("📊 FINAL RESULTS:");
  console.log("📊 Available presets:", availablePresets.length);
  console.log("📊 Top presets selected:", topPresets.length);
  console.log("📊 Selected preset titles:", topPresets.map(p => p.title));
  
  // Force fallback if less than 3 presets found
  if (topPresets.length < 3) {
    console.log("🚨 Too few presets found, forcing fallback system");
  }

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

  // If too few presets match, create dynamic graphs from available data
  if (topPresets.length < 3) {
    const availableDataKeys = Object.keys(timeSeriesData || {}).filter(key => 
      timeSeriesData[key] && timeSeriesData[key].length > 0
    );
    
    if (availableDataKeys.length === 0) {
      return (
        <div className={`text-center py-12 ${className}`}>
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Available</h3>
          <p className="text-slate-600">
            No flight data found in your log file for visualization.
          </p>
        </div>
      );
    }
    
    // Create fallback graphs from available data (top 12 parameters)
    const fallbackGraphs = availableDataKeys.slice(0, 12);
    
    console.log("🔄 FALLBACK MODE ACTIVATED");
    console.log("🔄 Creating graphs for:", fallbackGraphs);
    
    return (
      <section className={className}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Flight Data Overview</h2>
              <p className="text-slate-600">
                Showing available flight parameters from your log file ({fallbackGraphs.length} graphs)
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {fallbackGraphs.length}
              </div>
              <div className="text-sm text-slate-500">
                Parameters
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {fallbackGraphs.map((param, index) => (
            <div key={param} className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                {param.replace(/_/g, ' ').toUpperCase()}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {(timeSeriesData[param] || []).length.toLocaleString()} data points
              </p>
              <Suspense fallback={<ChartSkeleton />}>
                <FlightChart
                  title={param}
                  data={timeSeriesData[param] || []}
                  parameter={param}
                  color={(['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#dc2626'][index % 8]) || '#3b82f6'}
                  height={200}
                />
              </Suspense>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">Custom Parameter View</h4>
          </div>
          <p className="text-sm text-yellow-700">
            No preset graph matches were found for your log file parameters. Showing available flight data instead. 
            For advanced plotting and analysis, use the <strong>Charts</strong> menu for full control.
          </p>
        </div>
      </section>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {topPresets.map((preset) => {
          const Icon = preset.icon;
          
          // Get data for available parameters only (with flexible matching)
          const availableParams = preset.parameters.filter(param => {
            // Check exact match first
            if (timeSeriesData[param] && timeSeriesData[param].length > 0) return true;
            
            // Check variations
            const variations = [
              param.toLowerCase(),
              param.toUpperCase(),
              param.replace(/_/g, ''),
              param.replace(/_/g, '.'),
            ];
            
            return variations.some(variation => 
              timeSeriesData[variation] && timeSeriesData[variation].length > 0
            );
          });
          
          // Get the actual parameter names that exist in the data
          const realParamNames = preset.parameters.map(param => {
            if (timeSeriesData[param]) return param;
            
            const variations = [
              param.toLowerCase(),
              param.toUpperCase(),
              param.replace(/_/g, ''),
              param.replace(/_/g, '.'),
            ];
            
            const found = variations.find(variation => timeSeriesData[variation]);
            return found || param;
          }).filter(param => timeSeriesData[param] && timeSeriesData[param].length > 0);
          
          if (realParamNames.length === 0) return null;

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
                  Showing {realParamNames.length} of {preset.parameters.length} parameters
                </div>
              </div>

              {/* Chart Content */}
              <div className="px-6 pb-6">
                <Suspense fallback={<ChartSkeleton />}>
                  {realParamNames.length === 1 ? (
                    // Single parameter chart
                    <FlightChart
                      title={preset.title}
                      data={timeSeriesData[realParamNames[0]!] || []}
                      parameter={realParamNames[0]!}
                      color={preset.colors[0] || '#3b82f6'}
                      height={200}
                    />
                  ) : (
                    // Multi-parameter chart
                    <div className="space-y-3">
                      {realParamNames.map((param, index) => (
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