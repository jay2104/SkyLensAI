"use client";

import { 
  Bot, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Clock,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  CheckCircle,
  Copy,
  Share
} from "lucide-react";
import { useState } from "react";
import AiConfidenceIndicator from "./AiConfidenceIndicator";

interface ExpertResponseProps {
  queryId: string;
  question: string;
  response: string;
  confidenceScore: number;
  methodology: {
    steps: string[];
    sources: string[];
    analysisType: string;
    contextUsed: boolean;
  };
  citations: {
    sources: string[];
    references: string[];
    disclaimers: string[];
  };
  processingTime: number;
  feedback?: string;
  createdAt: Date;
  logFile?: {
    id: string;
    fileName: string;
    fileType: string;
  };
  onFeedback?: (feedback: "helpful" | "not_helpful" | "partially_helpful") => void;
  onFollowUp?: (question: string) => void;
  className?: string;
}

export default function ExpertResponse({
  queryId,
  question,
  response,
  confidenceScore,
  methodology,
  citations,
  processingTime,
  feedback,
  createdAt,
  logFile,
  onFeedback,
  onFollowUp,
  className = ""
}: ExpertResponseProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpQuestion.trim() && onFollowUp) {
      onFollowUp(followUpQuestion.trim());
      setFollowUpQuestion("");
      setShowFollowUp(false);
    }
  };

  const formatResponseText = (text: string) => {
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^##\s(.+)$/gm, '<h3 class="text-base font-semibold text-slate-900 mt-4 mb-2">$1</h3>')
      .replace(/^-\s(.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/(<li.*?>.*?<\/li>)/gs, '<ul class="list-disc space-y-1 mb-3">$1</ul>');
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900">Virtual Expert Response</h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{processingTime}ms</span>
                <span>•</span>
                <span>{createdAt.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-1">
              <p className="text-sm text-slate-600 font-medium mb-2">
                "{question}"
              </p>
              {logFile && (
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <FileText className="w-3 h-3" />
                  <span>Context: {logFile.fileName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response Content */}
      <div className="p-4 space-y-4">
        {/* Main Response */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div 
            className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatResponseText(response) }}
          />
        </div>

        {/* Confidence Indicator */}
        <AiConfidenceIndicator
          confidence={confidenceScore}
          methodology={methodology.steps.map((step, index) => ({
            step: index + 1,
            title: step,
            description: `Analysis methodology step ${index + 1}`,
            confidence: confidenceScore,
          }))}
          dataSources={methodology.sources.map(source => ({
            name: source,
            type: "model" as const,
            reliability: confidenceScore,
            description: `${source} data source`
          }))}
          limitations={citations.disclaimers}
          showDetails={false}
        />

        {/* Citations & Sources */}
        <div className="border-t border-slate-200 pt-4">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Sources & Citations</span>
            {showCitations ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showCitations && (
            <div className="mt-3 space-y-3">
              {/* Sources */}
              <div>
                <h4 className="text-xs font-medium text-slate-700 mb-2">Data Sources</h4>
                <div className="space-y-1">
                  {citations.sources.map((source, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      <span>{source}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* References */}
              {citations.references.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-700 mb-2">References</h4>
                  <div className="space-y-1">
                    {citations.references.map((reference, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-slate-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span>{reference}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Methodology Context */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Analysis Context</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>
                    <span className="font-medium">Type:</span> {methodology.analysisType}
                  </div>
                  <div>
                    <span className="font-medium">Context:</span> {methodology.contextUsed ? "Flight data used" : "General knowledge"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          {/* Feedback */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500">Was this helpful?</span>
            <div className="flex space-x-1">
              <button
                onClick={() => onFeedback?.("helpful")}
                disabled={feedback === "helpful"}
                className={`p-2 rounded-lg transition-colors ${
                  feedback === "helpful"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600"
                }`}
                title="Helpful"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback?.("partially_helpful")}
                disabled={feedback === "partially_helpful"}
                className={`p-2 rounded-lg transition-colors ${
                  feedback === "partially_helpful"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
                }`}
                title="Partially helpful"
              >
                <MessageSquare className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback?.("not_helpful")}
                disabled={feedback === "not_helpful"}
                className={`p-2 rounded-lg transition-colors ${
                  feedback === "not_helpful"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(response, "response")}
              className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-800 transition-colors px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedText === "response" ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={() => setShowFollowUp(!showFollowUp)}
              className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 transition-colors px-2 py-1 rounded bg-purple-50 hover:bg-purple-100"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Follow Up</span>
            </button>
          </div>
        </div>

        {/* Follow-up Question */}
        {showFollowUp && (
          <div className="border-t border-slate-200 pt-4">
            <form onSubmit={handleFollowUpSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  Ask a follow-up question:
                </label>
                <textarea
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  placeholder="Ask for clarification or additional details..."
                  className="w-full p-2 text-sm border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{followUpQuestion.length}/500</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowFollowUp(false)}
                    className="text-xs text-slate-600 hover:text-slate-800 px-3 py-1 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!followUpQuestion.trim() || followUpQuestion.length > 500}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-medium px-3 py-1 rounded transition-colors"
                  >
                    Ask
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <p className="text-xs text-slate-600">
            This response is AI-generated. Please verify critical information with qualified personnel.
          </p>
        </div>
      </div>
    </div>
  );
}