"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Settings, Search, X } from "lucide-react";
import { api } from "~/trpc/react";

interface ParametersSidebarProps {
  logFileId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface VehicleParameter {
  name: string;
  value: number | string;
  default: number | string;
  timestamp: number;
}

export default function ParametersSidebar({ logFileId, isOpen, onClose }: ParametersSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch vehicle parameters
  const { data: vehicleParams, isLoading, error } = api.logFile.getVehicleParameters.useQuery(
    { logFileId },
    { 
      enabled: isOpen && !!logFileId,
      retry: false 
    }
  );

  // Group parameters by category (first part of parameter name)
  const groupedParameters = vehicleParams?.parameters?.reduce((groups: Record<string, VehicleParameter[]>, param) => {
    const category = param.name.split('_')[0] || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category]!.push(param);
    return groups;
  }, {}) || {};

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter parameters based on search term
  const filteredGroups = Object.entries(groupedParameters).reduce((filtered: Record<string, VehicleParameter[]>, [category, params]) => {
    const matchingParams = params.filter(param => 
      param.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matchingParams.length > 0) {
      filtered[category] = matchingParams;
    }
    return filtered;
  }, {});

  const formatValue = (value: number | string): string => {
    if (typeof value === "number") {
      if (Number.isInteger(value)) return value.toString();
      return value.toFixed(2);
    }
    return String(value);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white border-l border-slate-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-80 lg:flex-shrink-0
        ${isOpen ? 'lg:block' : 'lg:hidden'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Parameters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search parameters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-slate-600">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading parameters...
            </div>
          )}

          {error && (
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  Failed to load parameters
                </p>
              </div>
            </div>
          )}

          {vehicleParams && (
            <div className="p-4">
              {/* Parameter Summary */}
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-slate-600">
                  <div className="flex justify-between mb-1">
                    <span>Total Parameters:</span>
                    <span className="font-medium text-slate-900">
                      {vehicleParams.totalCount}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Categories:</span>
                    <span className="font-medium text-slate-900">
                      {Object.keys(groupedParameters).length}
                    </span>
                  </div>
                  {searchTerm && (
                    <div className="flex justify-between">
                      <span>Filtered:</span>
                      <span className="font-medium text-slate-900">
                        {Object.values(filteredGroups).reduce((sum, params) => sum + params.length, 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                {Object.entries(filteredGroups).map(([categoryName, parameters]) => (
                  <div key={categoryName} className="border border-slate-200 rounded-lg">
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      className="w-full p-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {expandedCategories.has(categoryName) ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="font-medium text-slate-900">{categoryName}</span>
                      </div>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {parameters.length}
                      </span>
                    </button>

                    {expandedCategories.has(categoryName) && (
                      <div className="border-t border-slate-200 bg-slate-25">
                        <div className="p-3 space-y-2">
                          {parameters.map((param) => (
                            <div key={param.name} className="bg-white rounded p-3 border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <code className="font-mono text-sm font-medium text-slate-900">
                                  {param.name}
                                </code>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-blue-600">
                                    {formatValue(param.value)}
                                  </span>
                                  {param.value !== param.default && (
                                    <span className="text-xs text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                      def: {formatValue(param.default)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {param.value !== param.default && (
                                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                  Modified from default
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {Object.keys(filteredGroups).length === 0 && searchTerm && (
                <div className="text-center py-8 text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2" />
                  <p>No parameters found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}