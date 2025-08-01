"use client";

import { useState, useMemo, useCallback } from "react";
import { Clock, Calendar, Rewind, FastForward, RotateCcw, Play, Pause } from "lucide-react";

interface TimeRange {
  start: number;
  end: number;
}

interface TimeRangeFilterProps {
  totalDuration: number; // Total flight duration in seconds
  currentRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

interface PresetRange {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  getRange: (duration: number) => TimeRange;
  description: string;
}

const PRESET_RANGES: PresetRange[] = [
  {
    name: "Full Flight",
    icon: Play,
    getRange: (duration) => ({ start: 0, end: duration }),
    description: "Entire flight duration"
  },
  {
    name: "Takeoff",
    icon: FastForward,
    getRange: (duration) => ({ start: 0, end: Math.min(120, duration * 0.1) }),
    description: "First 2 minutes or 10% of flight"
  },
  {
    name: "Landing",
    icon: Rewind,
    getRange: (duration) => ({ start: Math.max(0, duration - 120), end: duration }),
    description: "Last 2 minutes or 10% of flight"
  },
  {
    name: "Middle Phase",
    icon: Pause,
    getRange: (duration) => ({ 
      start: duration * 0.25, 
      end: duration * 0.75 
    }),
    description: "Middle 50% of flight (cruise phase)"
  },
  {
    name: "First Half",
    icon: FastForward,
    getRange: (duration) => ({ start: 0, end: duration * 0.5 }),
    description: "First half of flight"
  },
  {
    name: "Second Half",
    icon: Rewind,
    getRange: (duration) => ({ start: duration * 0.5, end: duration }),
    description: "Second half of flight"
  }
];

export default function TimeRangeFilter({
  totalDuration,
  currentRange,
  onRangeChange,
  className = ""
}: TimeRangeFilterProps) {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'range' | null>(null);
  const [tempRange, setTempRange] = useState<TimeRange | null>(null);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format duration display
  const formatDuration = useCallback((seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${Math.round(seconds / 3600)}h`;
  }, []);

  // Calculate percentage positions for the slider
  const startPercent = (currentRange.start / totalDuration) * 100;
  const endPercent = (currentRange.end / totalDuration) * 100;
  const rangePercent = endPercent - startPercent;

  // Handle preset selection
  const handlePresetSelect = (preset: PresetRange) => {
    const newRange = preset.getRange(totalDuration);
    onRangeChange(newRange);
  };

  // Handle slider interactions
  const handleSliderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const clickTime = (clickPercent / 100) * totalDuration;

    // Determine if we should move start or end based on which is closer
    const distanceToStart = Math.abs(clickTime - currentRange.start);
    const distanceToEnd = Math.abs(clickTime - currentRange.end);

    if (distanceToStart < distanceToEnd) {
      onRangeChange({ ...currentRange, start: Math.max(0, clickTime) });
    } else {
      onRangeChange({ ...currentRange, end: Math.min(totalDuration, clickTime) });
    }
  };

  // Handle manual time input
  const handleTimeInputChange = (type: 'start' | 'end', value: string) => {
    const parts = value.split(':').map(v => parseInt(v) || 0);
    const mins = parts[0] || 0;
    const secs = parts[1] || 0;
    const totalSeconds = mins * 60 + secs;

    if (type === 'start') {
      onRangeChange({
        ...currentRange,
        start: Math.max(0, Math.min(totalSeconds, currentRange.end - 1))
      });
    } else {
      onRangeChange({
        ...currentRange,
        end: Math.min(totalDuration, Math.max(totalSeconds, currentRange.start + 1))
      });
    }
  };

  // Calculate statistics
  const duration = currentRange.end - currentRange.start;
  const percentageOfFlight = (duration / totalDuration) * 100;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Time Range Filter</h3>
        </div>
        <div className="text-sm text-slate-500">
          {formatDuration(duration)} ({percentageOfFlight.toFixed(1)}% of flight)
        </div>
      </div>

      {/* Current Range Display */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
            <input
              type="text"
              value={formatTime(currentRange.start)}
              onChange={(e) => handleTimeInputChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
            <input
              type="text"
              value={formatTime(currentRange.end)}
              onChange={(e) => handleTimeInputChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={formatTime(totalDuration)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
            <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
              {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>0:00</span>
          <span>Flight Timeline</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
        
        <div className="relative">
          {/* Track */}
          <div 
            className="w-full h-4 bg-slate-200 rounded-lg cursor-pointer relative overflow-hidden"
            onClick={handleSliderClick}
          >
            {/* Progress fill */}
            <div
              className="absolute top-0 h-full bg-blue-500 rounded-lg transition-all duration-200"
              style={{
                left: `${startPercent}%`,
                width: `${rangePercent}%`
              }}
            />
            
            {/* Start handle */}
            <div
              className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full transform -translate-y-1/2 cursor-grab shadow-md hover:shadow-lg transition-shadow"
              style={{ left: `${startPercent}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
            
            {/* End handle */}
            <div
              className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full transform -translate-y-1/2 cursor-grab shadow-md hover:shadow-lg transition-shadow"
              style={{ left: `${endPercent}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
          </div>
          
          {/* Time markers */}
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            {Array.from({ length: 11 }, (_, i) => {
              const time = (totalDuration * i) / 10;
              return (
                <div key={i} className="text-center">
                  <div className="w-px h-2 bg-slate-300 mx-auto mb-1" />
                  {formatTime(time)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preset Ranges */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Select</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRESET_RANGES.map((preset) => {
            const presetRange = preset.getRange(totalDuration);
            const isActive = presetRange.start === currentRange.start && presetRange.end === currentRange.end;
            const Icon = preset.icon;
            
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
                title={preset.description}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {formatTime(presetRange.start)} - {formatTime(presetRange.end)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Range Statistics */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">{formatTime(duration)}</div>
            <div className="text-sm text-slate-500">Selected Duration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{percentageOfFlight.toFixed(1)}%</div>
            <div className="text-sm text-slate-500">of Total Flight</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{formatTime(currentRange.start)}</div>
            <div className="text-sm text-slate-500">Start Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{formatTime(currentRange.end)}</div>
            <div className="text-sm text-slate-500">End Time</div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onRangeChange({ start: 0, end: totalDuration })}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Full Range</span>
        </button>
      </div>
    </div>
  );
}