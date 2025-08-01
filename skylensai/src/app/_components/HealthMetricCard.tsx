"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Navigation, 
  Battery, 
  Satellite, 
  HardDrive,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

type HealthStatus = "good" | "warning" | "error";
type TrendDirection = "up" | "down" | "stable";
type IconType = "Clock" | "TrendingUp" | "Navigation" | "Battery" | "Satellite" | "HardDrive";

interface HealthMetricCardProps {
  title: string;
  value: string;
  unit: string;
  status: HealthStatus;
  trend: TrendDirection;
  icon: IconType;
  subtitle?: string;
  onClick?: () => void;
}

const iconMap = {
  Clock,
  TrendingUp,
  Navigation,
  Battery,
  Satellite,
  HardDrive,
};

const statusConfig = {
  good: {
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    statusIcon: CheckCircle,
    statusIconColor: "text-green-500",
  },
  warning: {
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    statusIcon: AlertTriangle,
    statusIconColor: "text-amber-500",
  },
  error: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    statusIcon: XCircle,
    statusIconColor: "text-red-500",
  },
};

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: "text-green-500",
    label: "Trending up",
  },
  down: {
    icon: TrendingDown,
    color: "text-red-500",
    label: "Trending down",
  },
  stable: {
    icon: Minus,
    color: "text-slate-400",
    label: "Stable",
  },
};

export default function HealthMetricCard({
  title,
  value,
  unit,
  status,
  trend,
  icon,
  subtitle,
  onClick,
}: HealthMetricCardProps) {
  const IconComponent = iconMap[icon];
  const statusStyles = statusConfig[status];
  const trendStyles = trendConfig[trend];
  const StatusIcon = statusStyles.statusIcon;
  const TrendIcon = trendStyles.icon;

  const cardClasses = `
    relative bg-white rounded-lg border ${statusStyles.borderColor} p-6 
    hover:shadow-lg transition-all duration-200 
    ${onClick ? "cursor-pointer hover:shadow-lg" : ""}
  `.trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <StatusIcon className={`w-5 h-5 ${statusStyles.statusIconColor}`} />
      </div>

      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${statusStyles.bgColor}`}>
          <IconComponent className={`w-6 h-6 ${statusStyles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-slate-900 truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center space-x-2">
        <TrendIcon className={`w-4 h-4 ${trendStyles.color}`} />
        <span className={`text-xs font-medium ${trendStyles.color}`}>
          {trendStyles.label}
        </span>
      </div>

      {/* Hover Effect */}
      {onClick && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

// Helper component for creating grouped metric cards
interface MetricGroup {
  title: string;
  metrics: Array<Omit<HealthMetricCardProps, "onClick"> & { id: string }>;
  onMetricClick?: (metricId: string) => void;
}

export function HealthMetricGroup({ title, metrics, onMetricClick }: MetricGroup) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <HealthMetricCard
            key={metric.id}
            {...metric}
            onClick={onMetricClick ? () => onMetricClick(metric.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// Specialized metric cards for common use cases
interface BatteryMetricProps {
  startVoltage: number;
  endVoltage: number;
  onClick?: () => void;
}

export function BatteryHealthCard({ startVoltage, endVoltage, onClick }: BatteryMetricProps) {
  const percentageUsed = ((startVoltage - endVoltage) / startVoltage) * 100;
  const status: HealthStatus = percentageUsed > 80 ? "error" : percentageUsed > 60 ? "warning" : "good";
  
  return (
    <HealthMetricCard
      title="Battery Consumption"
      value={percentageUsed.toFixed(1)}
      unit="%"
      status={status}
      trend="stable"
      icon="Battery"
      subtitle={`${startVoltage.toFixed(1)}V → ${endVoltage.toFixed(1)}V`}
      onClick={onClick}
    />
  );
}

interface GPSQualityCardProps {
  quality: number;
  onClick?: () => void;
}

export function GPSQualityCard({ quality, onClick }: GPSQualityCardProps) {
  const status: HealthStatus = quality > 85 ? "good" : quality > 60 ? "warning" : "error";
  
  return (
    <HealthMetricCard
      title="GPS Signal Quality"
      value={quality.toString()}
      unit="%"
      status={status}
      trend="stable"
      icon="Satellite"
      subtitle="Average signal strength"
      onClick={onClick}
    />
  );
}