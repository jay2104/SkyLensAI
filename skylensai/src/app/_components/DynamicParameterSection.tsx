"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Activity, Battery, Navigation, Settings, Radar, BarChart3, Thermometer, Info } from 'lucide-react';
import FlightChart from './FlightChart';

interface ParameterMetadata {
  parameter: string;
  displayName: string;
  category: string;
  description: string;
  priority: number;
  unit: string;
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  colorHint: string;
  isCore: boolean;
}

interface ParameterCategory {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  parameters: ParameterMetadata[];
  priority: number;
}

interface TimeSeriesData {
  [parameter: string]: Array<{
    timestamp: number;
    value: number;
    unit: string;
  }>;
}

interface DynamicParameterSectionProps {
  category: ParameterCategory;
  timeSeriesData: TimeSeriesData;
  className?: string;
}

// Icon mapping for dynamic icons
const iconMap = {
  Activity,
  Battery, 
  Navigation,
  Settings,
  Radar,
  BarChart3,
  Thermometer,
  Info
};

export default function DynamicParameterSection({ 
  category, 
  timeSeriesData, 
  className = "" 
}: DynamicParameterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);

  // Get the appropriate icon component
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || BarChart3;

  // Filter parameters that have data
  const availableParameters = useMemo(() => {
    return category.parameters.filter(param => 
      timeSeriesData[param.parameter] && timeSeriesData[param.parameter]!.length > 0
    );
  }, [category.parameters, timeSeriesData]);

  // Auto-select high priority parameters initially
  useMemo(() => {
    if (selectedParameters.length === 0 && availableParameters.length > 0) {
      const highPriorityParams = availableParameters
        .filter(p => p.priority >= 4 || p.isCore)
        .slice(0, 3)
        .map(p => p.parameter);
      
      if (highPriorityParams.length === 0) {
        // If no high priority params, select first 2
        setSelectedParameters(availableParameters.slice(0, 2).map(p => p.parameter));
      } else {
        setSelectedParameters(highPriorityParams);
      }
    }
  }, [availableParameters, selectedParameters.length]);

  const handleParameterToggle = (parameter: string) => {
    setSelectedParameters(prev => 
      prev.includes(parameter)
        ? prev.filter(p => p !== parameter)
        : [...prev, parameter]
    );
  };

  if (availableParameters.length === 0) {
    return null; // Don't render empty categories
  }

  const selectedData = selectedParameters.reduce((acc, param) => {
    if (timeSeriesData[param]) {
      acc[param] = timeSeriesData[param]!;
    }
    return acc;
  }, {} as TimeSeriesData);

  return (
    <section className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
      {/* Category Header */}
      <div 
        className="p-6 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{category.displayName}</h3>
              <p className="text-sm text-slate-600 mt-1">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {availableParameters.length} parameters
              </div>
              <div className="text-xs text-slate-500">
                {selectedParameters.length} selected
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Category Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Parameter Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Available Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableParameters.map((param) => {
                const isSelected = selectedParameters.includes(param.parameter);
                const dataPoints = timeSeriesData[param.parameter]?.length || 0;
                
                return (
                  <div
                    key={param.parameter}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleParameterToggle(param.parameter)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: param.colorHint }}
                          />
                          <h5 className="font-medium text-slate-900 text-sm truncate">
                            {param.displayName}
                          </h5>
                          {param.isCore && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              Core
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {param.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            {dataPoints.toLocaleString()} points
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {param.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts for Selected Parameters */}
          {selectedParameters.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-sm font-medium text-slate-700">
                Selected Parameter Charts ({selectedParameters.length})
              </h4>
              
              {selectedParameters.map((paramName) => {
                const param = availableParameters.find(p => p.parameter === paramName);
                const data = selectedData[paramName];
                
                if (!param || !data || data.length === 0) return null;
                
                return (
                  <div key={paramName} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: param.colorHint }}
                        />
                        <div>
                          <h5 className="font-medium text-slate-900">{param.displayName}</h5>
                          <p className="text-sm text-slate-600">{param.description}</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {data.length.toLocaleString()} data points
                      </div>
                    </div>
                    
                    <FlightChart
                      title={param.displayName}
                      data={data}
                      parameter={paramName}
                      color={param.colorHint}
                      chartType={param.chartType}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* No Selection State */}
          {selectedParameters.length === 0 && (
            <div className="text-center py-8">
              <IconComponent className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h4 className="text-lg font-medium text-slate-900 mb-2">No Parameters Selected</h4>
              <p className="text-slate-600">
                Select parameters from the list above to view their charts and analysis.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}