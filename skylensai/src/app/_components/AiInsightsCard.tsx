"use client";

import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { OpenAIService, type DroneContext, type AIDroneInsight } from "~/server/services/openaiService";

interface AiInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: "performance" | "safety" | "efficiency" | "maintenance";
  priority: "high" | "medium" | "low";
}

interface AiInsightsCardProps {
  logFileName: string;
  isUpgradeUser?: boolean;
  sampleInsights?: AiInsight[];
  droneContext?: DroneContext;
  onUpgradeClick?: () => void;
  onPreviewClick?: () => void;
  className?: string;
}

const categoryConfig = {
  performance: {
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Performance"
  },
  safety: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Safety"
  },
  efficiency: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Efficiency"
  },
  maintenance: {
    icon: Info,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "Maintenance"
  }
};

const defaultSampleInsights: AiInsight[] = [
  {
    id: "1",
    title: "Battery optimization opportunity detected",
    description: "Flight pattern suggests 12% battery life extension possible with route optimization",
    confidence: 0.87,
    category: "efficiency",
    priority: "high"
  },
  {
    id: "2", 
    title: "GPS signal degradation pattern identified",
    description: "Intermittent GPS quality drops may indicate antenna positioning issue",
    confidence: 0.74,
    category: "maintenance",
    priority: "medium"
  },
  {
    id: "3",
    title: "Flight mode transitions analysis available",
    description: "Aggressive mode changes detected - smoother transitions could improve stability",
    confidence: 0.92,
    category: "performance",
    priority: "high"
  }
];

export default function AiInsightsCard({
  logFileName,
  isUpgradeUser = false,
  sampleInsights = defaultSampleInsights,
  droneContext,
  onUpgradeClick,
  onPreviewClick,
  className = ""
}: AiInsightsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [realInsights, setRealInsights] = useState<AiInsight[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [useRealAI, setUseRealAI] = useState(false);

  // Generate real AI insights when droneContext is provided and user is Pro
  useEffect(() => {
    async function generateRealInsights() {
      if (!droneContext || !isUpgradeUser || isLoadingAI) return;
      
      setIsLoadingAI(true);
      setAiError(null);
      
      try {
        const aiInsights = await OpenAIService.generateFlightInsights(droneContext, 3);
        
        // Convert AIDroneInsight to AiInsight format
        const convertedInsights: AiInsight[] = aiInsights.map((insight, index) => ({
          id: `ai-${index + 1}`,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          category: insight.category,
          priority: insight.priority
        }));
        
        setRealInsights(convertedInsights);
        setUseRealAI(true);
      } catch (error) {
        console.error('AI insights generation failed:', error);
        setAiError('AI analysis temporarily unavailable');
        setUseRealAI(false);
      } finally {
        setIsLoadingAI(false);
      }
    }

    generateRealInsights();
  }, [droneContext, isUpgradeUser]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-amber-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High confidence";
    if (confidence >= 0.6) return "Medium confidence";
    return "Low confidence";
  };

  // Use real AI insights if available, otherwise fallback to samples
  const displayInsights = useRealAI ? realInsights : sampleInsights;
  const isAIGenerated = useRealAI && realInsights.length > 0;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <span>AI Insights</span>
              {isLoadingAI ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-500" />
              )}
            </h3>
            <p className="text-sm text-slate-600">
              {isLoadingAI ? 'Generating AI analysis...' : 
               isAIGenerated ? `Real AI analysis for ${logFileName}` :
               `Advanced analysis for ${logFileName}`}
            </p>
          </div>
        </div>
        
        {!isUpgradeUser && (
          <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Pro Feature</span>
          </div>
        )}
      </div>

      {/* AI Error Display */}
      {aiError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-700">{aiError}</p>
          </div>
        </div>
      )}

      {/* AI Insights Preview */}
      <div className="space-y-3 mb-4">
        {displayInsights.slice(0, isExpanded ? displayInsights.length : 2).map((insight) => {
          const CategoryIcon = categoryConfig[insight.category].icon;
          
          return (
            <div 
              key={insight.id}
              className="bg-white rounded-lg p-4 border border-slate-200 relative"
            >
              {!isUpgradeUser && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-white/95 rounded-lg z-10" />
              )}
              
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-lg ${categoryConfig[insight.category].bgColor}`}>
                  <CategoryIcon className={`w-4 h-4 ${categoryConfig[insight.category].color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {insight.title}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(insight.confidence).replace('text-', 'bg-')}`} />
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {insight.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {categoryConfig[insight.category].label}
                    </span>
                    <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {getConfidenceLabel(insight.confidence)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {!isExpanded && displayInsights.length > 2 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            disabled={isLoadingAI}
          >
            {isLoadingAI ? 'Loading insights...' : `View ${displayInsights.length - 2} more insights...`}
          </button>
        )}
      </div>

      {/* Call to Action */}
      <div className="border-t border-blue-200 pt-4">
        {isUpgradeUser ? (
          <button
            onClick={onPreviewClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Full AI Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                {isAIGenerated ? 
                  'Real AI insights powered by OpenAI GPT-4' :
                  'Unlock powerful AI insights to optimize your flight performance'
                }
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Performance optimization</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Safety recommendations</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Predictive maintenance</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onPreviewClick}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg border border-slate-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Try AI Preview</span>
              </button>
              <button
                onClick={onUpgradeClick}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transparency note */}
      <div className="mt-3 pt-3 border-t border-blue-100">
        <p className="text-xs text-slate-500 text-center">
          AI insights are based on flight data analysis and should be verified by qualified personnel
        </p>
      </div>
    </div>
  );
}