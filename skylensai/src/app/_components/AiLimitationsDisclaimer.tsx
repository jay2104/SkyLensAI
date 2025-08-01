"use client";

import { 
  AlertTriangle, 
  Info, 
  ExternalLink,
  X,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

interface DisclaimerPoint {
  title: string;
  description: string;
  type: "warning" | "info" | "critical";
}

interface AiLimitationsDisclaimerProps {
  variant?: "inline" | "modal" | "banner";
  showTitle?: boolean;
  customPoints?: DisclaimerPoint[];
  onClose?: () => void;
  onAccept?: () => void;
  className?: string;
}

const defaultDisclaimerPoints: DisclaimerPoint[] = [
  {
    title: "AI Analysis Limitations",
    description: "AI insights are based on available flight data and may not capture all factors affecting flight performance or safety.",
    type: "warning"
  },
  {
    title: "Professional Verification Required",
    description: "All AI recommendations should be verified by qualified aviation professionals before making any operational decisions.",
    type: "critical"
  },
  {
    title: "Data Quality Dependency",
    description: "The accuracy of AI analysis depends on the quality and completeness of the input flight data.",
    type: "info"
  },
  {
    title: "Model Limitations",
    description: "AI models are trained on historical data and may not predict accurately in unprecedented conditions.",
    type: "warning"
  },
  {
    title: "No Liability",
    description: "SkyLensAI and its AI analysis tools are provided for informational purposes only and do not constitute professional advice.",
    type: "critical"
  }
];

const pointTypeConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  critical: {
    icon: AlertTriangle,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
};

export default function AiLimitationsDisclaimer({
  variant = "inline",
  showTitle = true,
  customPoints = defaultDisclaimerPoints,
  onClose,
  onAccept,
  className = ""
}: AiLimitationsDisclaimerProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    setIsAccepted(true);
    onAccept?.();
  };

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Modal Header */}
          <div className="bg-amber-50 border-b border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    AI Analysis Disclaimer
                  </h3>
                  <p className="text-sm text-slate-600">
                    Important limitations and considerations
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              )}
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="space-y-4">
              {customPoints.map((point, index) => {
                const config = pointTypeConfig[point.type];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">
                          {point.title}
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="accept-disclaimer"
                  checked={isAccepted}
                  onChange={(e) => setIsAccepted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="accept-disclaimer" className="text-sm text-slate-700">
                  I understand and accept these limitations
                </label>
              </div>
              <div className="flex space-x-3">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleAccept}
                  disabled={!isAccepted}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isAccepted
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900 mb-1">
                AI Analysis Disclaimer
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                AI insights should be verified by qualified personnel. This analysis is for informational purposes only and does not constitute professional advice.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-amber-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && (
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h4 className="font-medium text-slate-900">
            AI Analysis Limitations
          </h4>
        </div>
      )}
      
      <div className="space-y-2">
        {customPoints.slice(0, 3).map((point, index) => {
          const config = pointTypeConfig[point.type];
          const Icon = config.icon;
          
          return (
            <div key={index} className="flex items-start space-x-2">
              <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-medium text-slate-700">
                  {point.title}:
                </span>{' '}
                {point.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            By using AI features, you acknowledge these limitations
          </p>
          <a
            href="#"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Full Terms</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}