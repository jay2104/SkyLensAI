"use client";

import { useState, Suspense } from "react";
import { ChevronDown, ChevronRight, BarChart3, Activity, Gauge, Settings } from "lucide-react";
import FlightChart from "./FlightChart";

interface DataPoint {
  timestamp: number;
  value: number;
  unit: string;
  parameter?: string;
}

interface ParameterCategoryProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  timeSeriesData: Record<string, DataPoint[]>;
  className?: string;
}

interface ParameterGroup {
  name: string;
  parameters: string[];
  chartType: "single" | "multi" | "comparison";
  color: string;
  unit?: string;
}

const PARAMETER_CATEGORIES = {
  "Flight Dynamics": {
    icon: Activity,
    description: "Core flight performance and movement analysis",
    groups: [
      {
        name: "Ground Speed Analysis",
        parameters: ["ground_speed", "air_speed", "gps_speed"],
        chartType: "multi" as const,
        color: "#3B82F6",
        unit: "m/s"
      },
      {
        name: "Climb Performance",
        parameters: ["climb_rate", "descent_rate", "vertical_speed"],
        chartType: "multi" as const,
        color: "#10B981",
        unit: "m/s"
      },
      {
        name: "Turn Dynamics", 
        parameters: ["turn_rate", "heading_rate", "yaw_rate"],
        chartType: "multi" as const,
        color: "#F59E0B",
        unit: "deg/s"
      },
      {
        name: "Wind Analysis",
        parameters: ["wind_speed", "wind_direction", "headwind", "crosswind"],
        chartType: "multi" as const,
        color: "#8B5CF6",
        unit: "m/s"
      }
    ]
  },
  "Power Systems": {
    icon: Gauge,
    description: "Battery, current, and power consumption analysis",
    groups: [
      {
        name: "Battery Performance",
        parameters: ["battery_voltage", "battery_current", "battery_remaining"],
        chartType: "multi" as const,
        color: "#EF4444",
        unit: "V/A/%"
      },
      {
        name: "Power Consumption",
        parameters: ["power_total", "power_motor", "power_avionics"],
        chartType: "multi" as const,
        color: "#F97316",
        unit: "W"
      },
      {
        name: "Efficiency Metrics",
        parameters: ["power_efficiency", "energy_per_distance", "flight_time_remaining"],
        chartType: "multi" as const,
        color: "#84CC16",
        unit: "Wh/km"
      }
    ]
  },
  "Control Inputs": {
    icon: Settings,
    description: "RC inputs, autopilot commands, and servo responses",
    groups: [
      {
        name: "RC Channel Inputs",
        parameters: ["rc_roll", "rc_pitch", "rc_throttle", "rc_yaw"],
        chartType: "multi" as const,
        color: "#06B6D4",
        unit: "PWM"
      },
      {
        name: "Autopilot Commands", 
        parameters: ["ap_roll", "ap_pitch", "ap_throttle", "ap_yaw"],
        chartType: "multi" as const,
        color: "#EC4899",
        unit: "deg/%"
      },
      {
        name: "Servo Outputs",
        parameters: ["servo_1", "servo_2", "servo_3", "servo_4"],
        chartType: "multi" as const,
        color: "#6366F1",
        unit: "PWM"
      }
    ]
  },
  "System Health": {
    icon: BarChart3,
    description: "CPU load, sensor status, and system diagnostics",
    groups: [
      {
        name: "System Performance",
        parameters: ["cpu_load", "memory_usage", "loop_time", "scheduler_overruns"],
        chartType: "multi" as const,
        color: "#F43F5E",
        unit: "%/ms"
      },
      {
        name: "Sensor Status",
        parameters: ["imu_health", "gps_health", "baro_health", "mag_health"],
        chartType: "comparison" as const,
        color: "#14B8A6",
        unit: "status"
      },
      {
        name: "Error Tracking",
        parameters: ["error_count", "warning_count", "failsafe_events", "vibration_level"],
        chartType: "multi" as const,
        color: "#DC2626",
        unit: "count/level"
      }
    ]
  }
};

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

export default function ParameterCategorySection({
  title,
  icon: Icon,
  description,
  timeSeriesData,
  className = ""
}: ParameterCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const categoryConfig = PARAMETER_CATEGORIES[title as keyof typeof PARAMETER_CATEGORIES];
  
  if (!categoryConfig) {
    return null;
  }

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const hasDataForGroup = (group: ParameterGroup) => {
    return group.parameters.some(param => 
      timeSeriesData[param] && timeSeriesData[param]!.length > 0
    );
  };

  const getGroupData = (group: ParameterGroup) => {
    const groupData: DataPoint[] = [];
    
    group.parameters.forEach(param => {
      const paramData = timeSeriesData[param];
      if (paramData && paramData.length > 0) {
        paramData.forEach(point => {
          groupData.push({
            ...point,
            parameter: param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          });
        });
      }
    });
    
    return groupData;
  };

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Category Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500">
            {categoryConfig.groups.filter(group => hasDataForGroup(group)).length} / {categoryConfig.groups.length} available
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Category Content */}
      {isExpanded && (
        <div className="space-y-8">
          {categoryConfig.groups.map((group) => {
            const hasData = hasDataForGroup(group);
            const isGroupExpanded = expandedGroups.has(group.name);
            const groupData = hasData ? getGroupData(group) : [];

            return (
              <div key={group.name} className="border border-slate-200 rounded-lg bg-white">
                {/* Group Header */}
                <div 
                  className="p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleGroup(group.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>{group.parameters.length} parameters</span>
                          <span>Unit: {group.unit}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            hasData ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {hasData ? `${groupData.length} data points` : 'No data'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {hasData && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">
                          {group.parameters.filter(param => timeSeriesData[param] && timeSeriesData[param]!.length > 0).length} active
                        </span>
                        {isGroupExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Group Charts */}
                {hasData && isGroupExpanded && (
                  <div className="p-6">
                    <Suspense fallback={<ChartSkeleton />}>
                      <FlightChart
                        title={group.name}
                        data={groupData}
                        parameter={group.name.toLowerCase().replace(/\s+/g, '_')}
                        color={group.color}
                        multiSeries={group.chartType === "multi" || group.chartType === "comparison"}
                        height={400}
                      />
                    </Suspense>
                  </div>
                )}

                {/* No Data State */}
                {!hasData && (
                  <div className="p-6 text-center text-slate-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h4 className="text-lg font-medium text-slate-700 mb-2">No Data Available</h4>
                    <p className="text-sm">
                      Data for {group.name.toLowerCase()} parameters was not found in this log file.
                    </p>
                    <div className="mt-4 text-xs space-y-1">
                      <div className="font-medium text-slate-600">Expected parameters:</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {group.parameters.map(param => (
                          <span key={param} className="px-2 py-1 bg-slate-100 rounded text-slate-600">
                            {param.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}