"use client";

import { useState } from "react";
import { Loader2, ChevronDown, ChevronRight, Eye, EyeOff, FileText } from "lucide-react";
import { api } from "~/trpc/react";

interface RawDataViewerProps {
  logFileId: string;
  className?: string;
}

interface MessageGroup {
  messageType: string;
  count: number;
  samples: Array<{
    timestamp: number;
    data: Record<string, any>;
  }>;
  fields: string[];
}

export default function RawDataViewer({ logFileId, className = "" }: RawDataViewerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [rawData, setRawData] = useState<MessageGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  // Use TRPC query for fetching raw data
  const { data: fetchedRawData, isLoading: isFetching, error: fetchError } = api.logFile.getRawParsedData.useQuery(
    { logFileId },
    { 
      enabled: isVisible && !rawData, // Only fetch when visible and not already loaded
      retry: false 
    }
  );

  // Update local state when data is fetched
  if (fetchedRawData && !rawData) {
    setRawData(fetchedRawData);
  }

  if (fetchError && !error) {
    setError(fetchError.message);
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const toggleMessageExpansion = (messageType: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageType)) {
      newExpanded.delete(messageType);
    } else {
      newExpanded.add(messageType);
    }
    setExpandedMessages(newExpanded);
  };

  const formatValue = (value: any): string => {
    if (typeof value === "number") {
      if (Number.isInteger(value)) return value.toString();
      return value.toFixed(6).replace(/\.?0+$/, "");
    }
    return String(value);
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toISOString().replace('T', ' ').replace('Z', '');
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>
      {/* Toggle Header */}
      <div 
        className="p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={toggleVisibility}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isVisible ? <EyeOff className="w-5 h-5 text-slate-600" /> : <Eye className="w-5 h-5 text-slate-600" />}
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Raw Parsed Data</h3>
              <p className="text-sm text-slate-600">
                View the actual message structure and data extracted from the log file
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {rawData && (
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {rawData.length} message types
              </span>
            )}
            <ChevronDown 
              className={`w-5 h-5 text-slate-400 transition-transform ${isVisible ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Raw Data Content */}
      {isVisible && (
        <div className="p-4">
          {isFetching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-slate-600">Loading raw data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Error loading raw data</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {rawData && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-slate-50 rounded-lg p-3">
                <h4 className="font-medium text-slate-900 mb-2">Data Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Message Types:</span>
                    <span className="font-medium text-slate-900 ml-2">{rawData.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Messages:</span>
                    <span className="font-medium text-slate-900 ml-2">
                      {rawData.reduce((sum, group) => sum + group.count, 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Fields:</span>
                    <span className="font-medium text-slate-900 ml-2">
                      {rawData.reduce((sum, group) => sum + group.fields.length, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Samples Shown:</span>
                    <span className="font-medium text-slate-900 ml-2">
                      {rawData.reduce((sum, group) => sum + group.samples.length, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Groups */}
              <div className="space-y-3">
                {rawData.map((group) => (
                  <div key={group.messageType} className="border border-slate-200 rounded-lg">
                    <div
                      className="p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleMessageExpansion(group.messageType)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {expandedMessages.has(group.messageType) ? (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          )}
                          <span className="font-mono text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            {group.messageType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>{group.count.toLocaleString()} messages</span>
                          <span>{group.fields.length} fields</span>
                          <span>{group.samples.length} samples</span>
                        </div>
                      </div>
                    </div>

                    {expandedMessages.has(group.messageType) && (
                      <div className="p-4 border-t border-slate-200">
                        {/* Fields */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-slate-900 mb-2">Fields ({group.fields.length}):</h5>
                          <div className="flex flex-wrap gap-1">
                            {group.fields.map((field) => (
                              <span 
                                key={field}
                                className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Sample Data */}
                        <div>
                          <h5 className="text-sm font-medium text-slate-900 mb-2">
                            Sample Data ({group.samples.length} most recent):
                          </h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {group.samples.map((sample, index) => (
                              <div key={index} className="bg-slate-50 rounded p-2 font-mono text-xs">
                                <div className="text-slate-500 mb-1">
                                  {formatTimestamp(sample.timestamp)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {Object.entries(sample.data).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-slate-600">{key}:</span>
                                      <span className="text-slate-900 font-medium">
                                        {formatValue(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}