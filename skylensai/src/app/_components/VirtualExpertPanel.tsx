"use client";

import { 
  MessageCircle, 
  Send, 
  History, 
  Lock, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Bot,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import AiConfidenceIndicator from "./AiConfidenceIndicator";

interface VirtualExpertPanelProps {
  logFileId?: string;
  logFileName?: string;
  userSubscriptionTier: "FREE" | "PRO" | "ENTERPRISE";
  onUpgradeClick?: () => void;
  className?: string;
}

interface QueryHistoryItem {
  id: string;
  question: string;
  createdAt: Date;
  status: string;
  response?: {
    response: string;
    confidenceScore: number;
    methodology: any;
    citations: any;
    processingTime: number;
    feedback?: string;
  };
  logFile?: {
    id: string;
    fileName: string;
    fileType: string;
  };
}

export default function VirtualExpertPanel({
  logFileId,
  logFileName,
  userSubscriptionTier,
  onUpgradeClick,
  className = ""
}: VirtualExpertPanelProps) {
  const [question, setQuestion] = useState("");
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPro = userSubscriptionTier !== "FREE";

  // Get usage stats
  const { data: usageStats } = api.analysis.getQueryUsageStats.useQuery(
    undefined,
    { enabled: isPro }
  );

  // Get query history
  const { data: queryHistory, refetch: refetchHistory } = api.analysis.getQueryHistory.useQuery(
    { limit: 10 },
    { enabled: isPro && isHistoryExpanded }
  );

  // Submit query mutation
  const submitQueryMutation = api.analysis.submitVirtualExpertQuery.useMutation({
    onSuccess: () => {
      setQuestion("");
      refetchHistory();
    },
  });

  // Submit feedback mutation
  const submitFeedbackMutation = api.analysis.submitQueryFeedback.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !isPro) return;

    try {
      await submitQueryMutation.mutateAsync({
        question: question.trim(),
        logFileId,
      });
    } catch (error) {
      console.error("Query submission failed:", error);
    }
  };

  const handleFeedback = async (queryId: string, feedback: "helpful" | "not_helpful" | "partially_helpful") => {
    try {
      await submitFeedbackMutation.mutateAsync({ queryId, feedback });
      refetchHistory();
    } catch (error) {
      console.error("Feedback submission failed:", error);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [question]);

  if (!isPro) {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <span>Virtual Expert</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </h3>
              <p className="text-sm text-slate-600">
                Ask questions about your drone and get expert answers
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Pro Feature</span>
          </div>
        </div>

        {/* Sample Questions Preview */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-white/95 rounded-lg z-10" />
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-700">
                  "Why did my battery drain so quickly during this flight?"
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Bot className="w-5 h-5 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-600">
                  Based on your flight log, I can see several factors contributing to increased power consumption...
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 font-medium">89% confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-3">
              Get instant expert answers to your drone questions
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Contextual analysis</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Expert knowledge base</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Confidence scoring</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Query history</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onUpgradeClick}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-3 border-t border-purple-100">
          <p className="text-xs text-slate-500 text-center">
            Virtual Expert provides AI-generated responses that should be verified by qualified personnel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <span>Virtual Expert</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </h3>
              <p className="text-sm text-slate-600">
                {logFileName ? `Ask questions about ${logFileName}` : "Ask questions about drone operations"}
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          {usageStats && (
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {usageStats.hasUnlimitedQueries ? "Unlimited" : `${usageStats.monthlyQueries}/${usageStats.monthlyLimit}`}
              </div>
              <div className="text-xs text-slate-500">
                {usageStats.hasUnlimitedQueries ? "Pro queries" : "queries this month"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Query Input */}
      <div className="p-4 border-b border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Ask a question${logFileName ? ` about ${logFileName}` : " about drone operations"}...`}
              className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ minHeight: "60px" }}
              disabled={submitQueryMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              {logFileId && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Using log context</span>
                </div>
              )}
              <span>{question.length}/2000</span>
            </div>
            
            <button
              type="submit"
              disabled={!question.trim() || question.length > 2000 || submitQueryMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              {submitQueryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{submitQueryMutation.isPending ? "Asking..." : "Ask Expert"}</span>
            </button>
          </div>
        </form>

        {submitQueryMutation.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">
                {submitQueryMutation.error.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Query History */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Query History</span>
            {isHistoryExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {queryHistory && queryHistory.queries.length > 0 && (
            <span className="text-xs text-slate-500">
              {queryHistory.queries.length} recent queries
            </span>
          )}
        </div>

        {isHistoryExpanded && (
          <div className="space-y-3">
            {queryHistory?.queries.map((query) => (
              <div
                key={query.id}
                className={`border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                  selectedHistoryItem === query.id ? "bg-slate-50 border-purple-200" : ""
                }`}
                onClick={() => setSelectedHistoryItem(
                  selectedHistoryItem === query.id ? null : query.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium truncate">
                      {query.question}
                    </p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                      </div>
                      {query.logFile && (
                        <div className="flex items-center space-x-1">
                          <span>•</span>
                          <span>{query.logFile.fileName}</span>
                        </div>
                      )}
                      {query.response && (
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            query.response.confidenceScore >= 0.8 ? "bg-green-500" :
                            query.response.confidenceScore >= 0.6 ? "bg-amber-500" :
                            "bg-red-500"
                          }`} />
                          <span>{Math.round(query.response.confidenceScore * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`w-3 h-3 rounded-full ${
                    query.status === "processed" ? "bg-green-500" :
                    query.status === "pending" ? "bg-amber-500" :
                    "bg-red-500"
                  }`} />
                </div>

                {selectedHistoryItem === query.id && query.response && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Bot className="w-4 h-4 text-purple-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {query.response.response}
                          </p>
                        </div>
                      </div>
                    </div>

                    <AiConfidenceIndicator
                      confidence={query.response.confidenceScore}
                      methodology={(() => {
                        const methodology = query.response.methodology as any;
                        return methodology?.steps?.map((step: string, index: number) => ({
                          step: index + 1,
                          title: step,
                          description: `Analysis step ${index + 1}`,
                          confidence: query.response!.confidenceScore,
                        })) || [];
                      })()}
                      className="text-xs"
                    />

                    {/* Feedback */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500">Was this helpful?</span>
                        <div className="flex space-x-1">
                          {["helpful", "partially_helpful", "not_helpful"].map((feedback) => (
                            <button
                              key={feedback}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(query.id, feedback as any);
                              }}
                              disabled={query.response?.feedback === feedback}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                query.response?.feedback === feedback
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {feedback === "helpful" ? "👍" : 
                               feedback === "partially_helpful" ? "👌" : "👎"}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-500">
                        Response time: {query.response.processingTime}ms
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {queryHistory?.queries.length === 0 && (
              <div className="text-center py-6 text-slate-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm">No queries yet</p>
                <p className="text-xs">Ask your first question to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 rounded-b-lg">
        <p className="text-xs text-slate-500 text-center">
          Virtual Expert responses are AI-generated and should be verified by qualified personnel
        </p>
      </div>
    </div>
  );
}