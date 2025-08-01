"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, CheckSquare, Square, TrendingUp, BarChart3 } from "lucide-react";

interface DataPoint {
  timestamp: number;
  value: number;
  unit: string;
  parameter?: string;
}

interface ParameterInfo {
  name: string;
  displayName: string;
  unit: string;
  category: string;
  dataPoints: number;
  available: boolean;
  description?: string;
}

interface ParameterSelectorProps {
  timeSeriesData: Record<string, DataPoint[]>;
  selectedParameters: string[];
  onParameterChange: (parameters: string[]) => void;
  onClose?: () => void;
  className?: string;
}

const PARAMETER_DEFINITIONS: Record<string, {
  displayName: string;
  category: string;
  description: string;
  priority: number;
}> = {
  // Flight Dynamics
  "altitude": { displayName: "Altitude", category: "Flight Dynamics", description: "Height above ground level", priority: 1 },
  "ground_speed": { displayName: "Ground Speed", category: "Flight Dynamics", description: "Speed relative to ground", priority: 2 },
  "climb_rate": { displayName: "Climb Rate", category: "Flight Dynamics", description: "Rate of altitude gain", priority: 3 },
  "descent_rate": { displayName: "Descent Rate", category: "Flight Dynamics", description: "Rate of altitude loss", priority: 3 },
  "vertical_speed": { displayName: "Vertical Speed", category: "Flight Dynamics", description: "Combined vertical movement", priority: 4 },
  "turn_rate": { displayName: "Turn Rate", category: "Flight Dynamics", description: "Rate of heading change", priority: 4 },
  "yaw_rate": { displayName: "Yaw Rate", category: "Flight Dynamics", description: "Angular velocity around vertical axis", priority: 5 },
  
  // Attitude & Orientation
  "roll": { displayName: "Roll", category: "Attitude", description: "Bank angle left/right", priority: 2 },
  "pitch": { displayName: "Pitch", category: "Attitude", description: "Nose up/down angle", priority: 2 },
  "yaw": { displayName: "Yaw", category: "Attitude", description: "Heading direction", priority: 3 },
  
  // Power Systems
  "battery_voltage": { displayName: "Battery Voltage", category: "Power Systems", description: "Main battery voltage", priority: 1 },
  "battery_current": { displayName: "Battery Current", category: "Power Systems", description: "Current draw from battery", priority: 2 },
  "power_total": { displayName: "Total Power", category: "Power Systems", description: "Total power consumption", priority: 3 },
  "battery_remaining": { displayName: "Battery Remaining", category: "Power Systems", description: "Estimated battery percentage", priority: 4 },
  
  // Control Inputs
  "rc_roll": { displayName: "RC Roll Input", category: "Control Inputs", description: "Pilot roll stick input", priority: 3 },
  "rc_pitch": { displayName: "RC Pitch Input", category: "Control Inputs", description: "Pilot pitch stick input", priority: 3 },
  "rc_throttle": { displayName: "RC Throttle Input", category: "Control Inputs", description: "Pilot throttle input", priority: 2 },
  "rc_yaw": { displayName: "RC Yaw Input", category: "Control Inputs", description: "Pilot yaw stick input", priority: 4 },
  
  // Motor Outputs
  "motor_1": { displayName: "Motor 1 Output", category: "Motor Outputs", description: "Front right motor PWM", priority: 4 },
  "motor_2": { displayName: "Motor 2 Output", category: "Motor Outputs", description: "Rear right motor PWM", priority: 4 },
  "motor_3": { displayName: "Motor 3 Output", category: "Motor Outputs", description: "Rear left motor PWM", priority: 4 },
  "motor_4": { displayName: "Motor 4 Output", category: "Motor Outputs", description: "Front left motor PWM", priority: 4 },
  
  // GPS & Navigation
  "gps_lat": { displayName: "GPS Latitude", category: "Navigation", description: "GPS latitude coordinate", priority: 5 },
  "gps_lng": { displayName: "GPS Longitude", category: "Navigation", description: "GPS longitude coordinate", priority: 5 },
};

export default function ParameterSelector({
  timeSeriesData,
  selectedParameters,
  onParameterChange,
  onClose,
  className = ""
}: ParameterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "category" | "dataPoints" | "priority">("priority");

  // Process available parameters
  const availableParameters = useMemo((): ParameterInfo[] => {
    const params: ParameterInfo[] = [];
    
    // Add parameters from time series data
    Object.keys(timeSeriesData).forEach(paramName => {
      const data = timeSeriesData[paramName];
      const definition = PARAMETER_DEFINITIONS[paramName];
      
      if (data && data.length > 0) {
        params.push({
          name: paramName,
          displayName: definition?.displayName || paramName.replace(/_/g, ' '),
          unit: data[0]?.unit || '',
          category: definition?.category || 'Other',
          dataPoints: data.length,
          available: true,
          description: definition?.description
        });
      }
    });
    
    // Add missing high-priority parameters as unavailable
    Object.keys(PARAMETER_DEFINITIONS).forEach(paramName => {
      const definition = PARAMETER_DEFINITIONS[paramName]!;
      if (definition.priority <= 3 && !timeSeriesData[paramName]) {
        params.push({
          name: paramName,
          displayName: definition.displayName,
          unit: '',
          category: definition.category,
          dataPoints: 0,
          available: false,
          description: definition.description
        });
      }
    });
    
    return params;
  }, [timeSeriesData]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(availableParameters.map(p => p.category));
    return ["All", ...Array.from(cats).sort()];
  }, [availableParameters]);

  // Filter and sort parameters
  const filteredParameters = useMemo(() => {
    let filtered = availableParameters.filter(param => {
      const matchesSearch = param.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           param.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || param.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort parameters
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.displayName.localeCompare(b.displayName);
        case "category":
          return a.category.localeCompare(b.category) || a.displayName.localeCompare(b.displayName);
        case "dataPoints":
          return b.dataPoints - a.dataPoints;
        case "priority":
          const aPriority = PARAMETER_DEFINITIONS[a.name]?.priority || 10;
          const bPriority = PARAMETER_DEFINITIONS[b.name]?.priority || 10;
          return aPriority - bPriority;
        default:
          return 0;
      }
    });

    return filtered;
  }, [availableParameters, searchTerm, selectedCategory, sortBy]);

  const handleParameterToggle = (paramName: string) => {
    const newSelected = selectedParameters.includes(paramName)
      ? selectedParameters.filter(p => p !== paramName)
      : [...selectedParameters, paramName];
    
    onParameterChange(newSelected);
  };

  const handleSelectAll = () => {
    const availableParams = filteredParameters.filter(p => p.available).map(p => p.name);
    onParameterChange(availableParams);
  };

  const handleClearAll = () => {
    onParameterChange([]);
  };

  const handleQuickSelect = (category: string) => {
    const categoryParams = availableParameters
      .filter(p => p.category === category && p.available)
      .map(p => p.name);
    
    const newSelected = [...new Set([...selectedParameters, ...categoryParams])];
    onParameterChange(newSelected);
  };

  const selectedCount = selectedParameters.length;
  const availableCount = availableParameters.filter(p => p.available).length;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Parameter Selection</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              {selectedCount} / {availableCount} selected
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search parameters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category and Sort Controls */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="dataPoints">Sort by Data Points</option>
            </select>

            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Quick Select Categories */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-500">Quick select:</span>
            {["Flight Dynamics", "Power Systems", "Attitude", "Control Inputs"].map(category => (
              <button
                key={category}
                onClick={() => handleQuickSelect(category)}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
              >
                + {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parameter List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-2">
          {filteredParameters.map((param) => {
            const isSelected = selectedParameters.includes(param.name);
            const isAvailable = param.available;

            return (
              <div
                key={param.name}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isAvailable
                    ? isSelected
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => isAvailable && handleParameterToggle(param.name)}
                    disabled={!isAvailable}
                    className={`transition-colors ${
                      isAvailable ? "text-blue-600 hover:text-blue-700" : "text-slate-400"
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${
                        isAvailable ? "text-slate-900" : "text-slate-500"
                      }`}>
                        {param.displayName}
                      </h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {param.category}
                      </span>
                      {param.unit && (
                        <span className="text-xs text-slate-600">
                          ({param.unit})
                        </span>
                      )}
                    </div>
                    {param.description && (
                      <p className="text-sm text-slate-500 mt-1">{param.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-500">
                  {isAvailable ? (
                    <>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="w-4 h-4" />
                        <span>{param.dataPoints.toLocaleString()} points</span>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Data available" />
                    </>
                  ) : (
                    <>
                      <span className="text-slate-400">No data</span>
                      <div className="w-2 h-2 bg-slate-300 rounded-full" title="No data available" />
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filteredParameters.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No parameters found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div>
            Showing {filteredParameters.filter(p => p.available).length} of {availableCount} available parameters
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full" />
              <span>No data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}