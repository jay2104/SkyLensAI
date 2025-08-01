"use client";

import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

interface DataSource {
  name: string;
  type: "sensor" | "model" | "historical" | "manual";
  reliability: number; // 0-1
  description: string;
}

interface MethodologyStep {
  step: number;
  title: string;
  description: string;
  confidence: number;
}

interface AiConfidenceIndicatorProps {
  confidence: number; // 0-1
  methodology?: MethodologyStep[];
  dataSources?: DataSource[];
  limitations?: string[];
  showDetails?: boolean;
  className?: string;
  onLearnMore?: () => void;
}

const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 0.8) return "high";
  if (confidence >= 0.6) return "medium";
  if (confidence >= 0.3) return "low";
  return "very-low";
};

const confidenceConfig = {
  "high": {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
    label: "High Confidence",
    description: "This analysis is based on strong data patterns and proven models"
  },
  "medium": {
    color: "text-amber-600", 
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: AlertTriangle,
    label: "Medium Confidence",
    description: "This analysis has moderate reliability but should be verified"
  },
  "low": {
    color: "text-orange-600",
    bgColor: "bg-orange-50", 
    borderColor: "border-orange-200",
    icon: AlertTriangle,
    label: "Low Confidence",
    description: "This analysis has limited reliability and requires careful review"
  },
  "very-low": {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200", 
    icon: XCircle,
    label: "Very Low Confidence",
    description: "This analysis should be used with extreme caution"
  }
};

const dataSourceTypeConfig = {
  sensor: {
    icon: "📡",
    label: "Sensor Data",
    description: "Direct measurements from flight sensors"
  },
  model: {
    icon: "🧠",
    label: "AI Model",
    description: "Machine learning model predictions"
  },
  historical: {
    icon: "📊",
    label: "Historical Data",
    description: "Patterns from similar flights"
  },
  manual: {
    icon: "👤",
    label: "Manual Input",
    description: "User-provided information"
  }
};

const defaultLimitations = [
  "AI analysis is based on available data and may not capture all factors",
  "Results should be verified by qualified personnel before making critical decisions",
  "Model accuracy may vary with different aircraft types and flight conditions",
  "Historical patterns may not predict future performance in all scenarios"
];

export default function AiConfidenceIndicator({
  confidence,
  methodology = [],
  dataSources = [],
  limitations = defaultLimitations,
  showDetails = false,
  className = "",
  onLearnMore
}: AiConfidenceIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [activeTab, setActiveTab] = useState<"methodology" | "sources" | "limitations">("methodology");
  
  const level = getConfidenceLevel(confidence);
  const config = confidenceConfig[level];
  const Icon = config.icon;
  const percentage = Math.round(confidence * 100);

  return (
    <div className={`bg-white rounded-lg border ${config.borderColor} ${className}`}>
      {/* Main Confidence Display */}
      <div className={`${config.bgColor} p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${config.color}`}>
                  {config.label}
                </span>
                <span className={`text-sm font-medium ${config.color}`}>
                  ({percentage}%)
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {config.description}
              </p>
            </div>
          </div>
          
          {/* Confidence Bar */}
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  level === "high" ? "bg-green-500" :
                  level === "medium" ? "bg-amber-500" :
                  level === "low" ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-medium w-8">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <span>Analysis Details</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Learn More</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
              {[
                { id: "methodology", label: "Methodology", count: methodology.length },
                { id: "sources", label: "Data Sources", count: dataSources.length },
                { id: "limitations", label: "Limitations", count: limitations.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 text-sm py-2 px-3 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 font-medium shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 text-xs text-slate-500">
                      ({tab.count})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[120px]">
              {activeTab === "methodology" && (
                <div className="space-y-3">
                  {methodology.length > 0 ? (
                    methodology.map((step) => (
                      <div key={step.step} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600">
                            {step.step}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-slate-900">
                              {step.title}
                            </h5>
                            <span className="text-xs text-slate-500">
                              {Math.round(step.confidence * 100)}% reliable
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm">No methodology details available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "sources" && (
                <div className="space-y-3">
                  {dataSources.length > 0 ? (
                    dataSources.map((source, index) => {
                      const typeConfig = dataSourceTypeConfig[source.type];
                      return (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg">
                            {typeConfig.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-slate-900">
                                {source.name}
                              </h5>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  source.reliability >= 0.8 ? "bg-green-500" :
                                  source.reliability >= 0.6 ? "bg-amber-500" :
                                  "bg-red-500"
                                }`} />
                                <span className="text-xs text-slate-500">
                                  {Math.round(source.reliability * 100)}% reliable
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-1">
                              {typeConfig.label}
                            </p>
                            <p className="text-sm text-slate-600">
                              {source.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm">No data source information available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "limitations" && (
                <div className="space-y-2">
                  {limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">
                        {limitation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-slate-400" />
          <p className="text-xs text-slate-500">
            AI analysis should always be verified by qualified personnel before making critical decisions
          </p>
        </div>
      </div>
    </div>
  );
}