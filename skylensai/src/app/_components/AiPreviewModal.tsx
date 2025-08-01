"use client";

import { useState } from "react";
import { 
  X, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Lock,
  Play
} from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}

interface FeatureComparison {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

interface AiPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  logFileName?: string;
  onUpgradeClick?: (tier: string) => void;
  onTryPreview?: () => void;
}

const pricingTiers: PricingTier[] = [
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    highlighted: true,
    popular: true,
    features: [
      "Unlimited AI flight analysis",
      "Performance optimization insights",
      "Safety recommendations",
      "Predictive maintenance alerts",
      "Advanced visualizations",
      "Priority support"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise", 
    price: "$99",
    period: "/month",
    features: [
      "Everything in Pro",
      "Custom AI models",
      "Fleet management insights",
      "API access",
      "White-label options",
      "Dedicated account manager"
    ]
  }
];

const featureComparisons: FeatureComparison[] = [
  {
    feature: "Flight visualization",
    free: true,
    pro: true,
    enterprise: true
  },
  {
    feature: "Basic health metrics",
    free: true,
    pro: true,
    enterprise: true
  },
  {
    feature: "AI-powered insights",
    free: "Preview only",
    pro: "Unlimited",
    enterprise: "Unlimited + Custom"
  },
  {
    feature: "Performance optimization",
    free: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Safety analysis",
    free: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Predictive maintenance",
    free: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Advanced visualizations",
    free: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Export capabilities",
    free: "Basic",
    pro: "Advanced",
    enterprise: "Full API"
  },
  {
    feature: "Support level",
    free: "Community",
    pro: "Priority",
    enterprise: "Dedicated"
  }
];

const aiCapabilityDemos = [
  {
    id: "performance",
    title: "Performance Optimization",
    icon: TrendingUp,
    description: "AI analyzes your flight patterns to identify opportunities for improved efficiency",
    demoInsight: "Your flight could achieve 15% better battery efficiency by adjusting altitude profile during cruise phase",
    confidence: 0.89,
    impact: "High"
  },
  {
    id: "safety",
    title: "Safety Analysis",
    icon: Shield,
    description: "Advanced safety pattern recognition identifies potential risks before they become critical",
    demoInsight: "Vibration pattern detected at 847Hz suggests potential gimbal bearing wear - recommend inspection",
    confidence: 0.76,
    impact: "Critical"
  },
  {
    id: "maintenance",
    title: "Predictive Maintenance",
    icon: Clock,
    description: "Machine learning predicts maintenance needs based on usage patterns and component health",
    demoInsight: "Based on flight hours and performance trends, battery replacement recommended in 23 flight hours",
    confidence: 0.82,
    impact: "Medium"
  }
];

export default function AiPreviewModal({
  isOpen,
  onClose,
  logFileName = "Your Flight Log",
  onUpgradeClick,
  onTryPreview
}: AiPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"demo" | "features" | "pricing">("demo");

  if (!isOpen) return null;

  const handleUpgrade = (tierId: string) => {
    onUpgradeClick?.(tierId);
  };

  const handleTryPreview = () => {
    onTryPreview?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <span>AI-Powered Flight Analysis</span>
                  <Sparkles className="w-5 h-5" />
                </h2>
                <p className="text-blue-100">
                  Unlock advanced insights for {logFileName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6 bg-white/10 rounded-lg p-1">
            {[
              { id: "demo", label: "AI Demo", icon: Play },
              { id: "features", label: "Features", icon: Star },
              { id: "pricing", label: "Pricing", icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 font-medium"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "demo" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  See AI Analysis in Action
                </h3>
                <p className="text-slate-600">
                  Experience how our AI transforms raw flight data into actionable insights
                </p>
              </div>

              <div className="grid gap-6">
                {aiCapabilityDemos.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <div key={demo.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">
                            {demo.title}
                          </h4>
                          <p className="text-slate-600 mb-4">
                            {demo.description}
                          </p>
                          
                          {/* Demo Insight */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-slate-900">AI Insight Preview:</h5>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600 font-medium">
                                  {Math.round(demo.confidence * 100)}% confidence
                                </span>
                              </div>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              "{demo.demoInsight}"
                            </p>
                            <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                              <span className="bg-slate-100 px-2 py-1 rounded">
                                Impact: {demo.impact}
                              </span>
                              <span className="bg-slate-100 px-2 py-1 rounded">
                                Category: {demo.title.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Try Preview CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    Ready to try AI analysis on your flight data?
                  </h4>
                  <p className="text-slate-600 mb-4">
                    Get a limited preview of AI insights for {logFileName}
                  </p>
                  <button
                    onClick={handleTryPreview}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Try AI Preview</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Compare Features
                </h3>
                <p className="text-slate-600">
                  See how AI upgrades enhance your flight analysis experience
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Feature</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-600">Free</th>
                      <th className="text-center py-3 px-4 font-semibold text-blue-600">Pro</th>
                      <th className="text-center py-3 px-4 font-semibold text-indigo-600">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparisons.map((comparison, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {comparison.feature}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof comparison.free === "boolean" ? (
                            comparison.free ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-slate-600">{comparison.free}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof comparison.pro === "boolean" ? (
                            comparison.pro ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-blue-600 font-medium">{comparison.pro}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof comparison.enterprise === "boolean" ? (
                            comparison.enterprise ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-indigo-600 font-medium">{comparison.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Choose Your Plan
                </h3>
                <p className="text-slate-600">
                  Unlock the full potential of AI-powered flight analysis
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-lg border-2 p-6 relative ${
                      tier.highlighted
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                        {tier.name}
                      </h4>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-slate-900">
                          {tier.price}
                        </span>
                        <span className="text-slate-600 ml-1">
                          {tier.period}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        tier.highlighted
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      Upgrade to {tier.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Money-back guarantee */}
              <div className="text-center py-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <Shield className="w-4 h-4 inline mr-1" />
                  30-day money-back guarantee • Cancel anytime
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Lock className="w-4 h-4" />
              <span>Secure checkout • No commitment</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Maybe Later
              </button>
              {activeTab !== "demo" && (
                <button
                  onClick={handleTryPreview}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Try Preview First
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}