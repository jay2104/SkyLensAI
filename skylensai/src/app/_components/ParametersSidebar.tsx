"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Settings, Search, X } from "lucide-react";
import { api } from "~/trpc/react";

interface ParametersSidebarProps {
  logFileId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ParameterCategory {
  name: string;
  parameters: Array<{
    parameter: string;
    displayName: string;
    description: string;
    unit: string;
    category: string;
  }>;
}

export default function ParametersSidebar({ logFileId, isOpen, onClose }: ParametersSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch parameter metadata
  const { data: parameterMetadata, isLoading, error } = api.logFile.getParameterMetadata.useQuery(
    { logFileId },
    { 
      enabled: isOpen && !!logFileId,
      retry: false 
    }
  );

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
  const filteredCategories = parameterMetadata?.categories?.map(category => ({
    ...category,
    parameters: category.parameters.filter(param => 
      param.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.parameters.length > 0) || [];

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

          {parameterMetadata && (
            <div className="p-4">
              {/* Parameter Summary */}
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-slate-600">
                  <div className="flex justify-between mb-1">
                    <span>Total Parameters:</span>
                    <span className="font-medium text-slate-900">
                      {parameterMetadata.totalParameters}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Categories:</span>
                    <span className="font-medium text-slate-900">
                      {parameterMetadata.categories.length}
                    </span>
                  </div>
                  {searchTerm && (
                    <div className="flex justify-between">
                      <span>Filtered:</span>
                      <span className="font-medium text-slate-900">
                        {filteredCategories.reduce((sum, cat) => sum + cat.parameters.length, 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div key={category.name} className="border border-slate-200 rounded-lg">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full p-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {expandedCategories.has(category.name) ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="font-medium text-slate-900">{category.name}</span>
                      </div>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {category.parameters.length}
                      </span>
                    </button>

                    {expandedCategories.has(category.name) && (
                      <div className="border-t border-slate-200 bg-slate-25">
                        <div className="p-3 space-y-3">
                          {category.parameters.map((param) => (
                            <div key={param.parameter} className="bg-white rounded p-3 border border-slate-100">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-medium text-slate-900 text-sm">
                                  {param.displayName}
                                </h4>
                                <span className="text-xs text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                  {param.unit}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mb-1">
                                {param.description}
                              </p>
                              <code className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                                {param.parameter}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredCategories.length === 0 && searchTerm && (
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