export type TrendDirection = "up" | "down" | "stable";

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export interface TrendAnalysisResult {
  trend: TrendDirection;
  confidence: number; // 0-100
  slope: number;
  correlation: number; // -1 to 1
}

export class TrendAnalyzer {
  private static readonly STABLE_THRESHOLD = 0.05; // 5% change considered stable
  private static readonly MIN_POINTS = 3;

  /**
   * Analyze trend for a parameter based on its time series data
   */
  static analyzeTrend(data: TimeSeriesPoint[]): TrendAnalysisResult {
    if (data.length < this.MIN_POINTS) {
      return {
        trend: "stable",
        confidence: 0,
        slope: 0,
        correlation: 0,
      };
    }

    // Sort by timestamp to ensure proper order
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate linear regression
    const { slope, correlation } = this.calculateLinearRegression(sortedData);

    // Calculate relative change
    const firstValue = sortedData[0]?.value || 0;
    const lastValue = sortedData[sortedData.length - 1]?.value || 0;
    const relativeChange = Math.abs((lastValue - firstValue) / Math.abs(firstValue));

    // Determine trend direction
    let trend: TrendDirection;
    if (relativeChange < this.STABLE_THRESHOLD && Math.abs(correlation) < 0.5) {
      trend = "stable";
    } else if (slope > 0) {
      trend = "up";
    } else {
      trend = "down";
    }

    // Calculate confidence based on correlation strength and data consistency
    const confidence = Math.min(100, Math.abs(correlation) * 100);

    return {
      trend,
      confidence: Math.round(confidence),
      slope,
      correlation,
    };
  }

  /**
   * Analyze battery trend (special case for degrading parameters)
   */
  static analyzeBatteryTrend(startVoltage: number, endVoltage: number, duration: number): TrendAnalysisResult {
    if (!startVoltage || !endVoltage || !duration) {
      return {
        trend: "stable",
        confidence: 0,
        slope: 0,
        correlation: 0,
      };
    }

    const voltageChange = endVoltage - startVoltage;
    const changeRate = Math.abs(voltageChange) / duration; // V/s
    const relativeChange = Math.abs(voltageChange) / startVoltage;

    // Battery should naturally decline, so "down" is expected/good
    let trend: TrendDirection;
    if (relativeChange < 0.02) { // Less than 2% change
      trend = "stable";
    } else if (voltageChange < 0) {
      // Normal battery discharge
      trend = "down";
    } else {
      // Unusual - battery voltage increasing (possibly charging or measurement error)
      trend = "up";
    }

    // Confidence based on how significant the change is
    const confidence = Math.min(100, Math.max(50, relativeChange * 500));

    return {
      trend,
      confidence: Math.round(confidence),
      slope: voltageChange / duration,
      correlation: voltageChange < 0 ? -0.9 : 0.9, // Strong correlation for battery discharge
    };
  }

  /**
   * Analyze altitude trend (special handling for flight phases)
   */
  static analyzeAltitudeTrend(data: TimeSeriesPoint[]): TrendAnalysisResult {
    if (data.length < this.MIN_POINTS) {
      return {
        trend: "stable",
        confidence: 0,
        slope: 0,
        correlation: 0,
      };
    }

    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    
    // Split into phases: takeoff, cruise, landing
    const totalDuration = sortedData[sortedData.length - 1]!.timestamp - sortedData[0]!.timestamp;
    const takeoffEnd = sortedData[0]!.timestamp + totalDuration * 0.3;
    const landingStart = sortedData[0]!.timestamp + totalDuration * 0.7;

    const takeoffData = sortedData.filter(p => p.timestamp <= takeoffEnd);
    const cruiseData = sortedData.filter(p => p.timestamp > takeoffEnd && p.timestamp < landingStart);
    const landingData = sortedData.filter(p => p.timestamp >= landingStart);

    // Analyze each phase
    const phases = [
      { name: "takeoff", data: takeoffData, expectedTrend: "up" },
      { name: "cruise", data: cruiseData, expectedTrend: "stable" },
      { name: "landing", data: landingData, expectedTrend: "down" },
    ].filter(phase => phase.data.length >= 2);

    if (phases.length === 0) {
      return this.analyzeTrend(sortedData);
    }

    // Find the dominant phase (longest duration)
    const dominantPhase = phases.reduce((max, phase) => 
      phase.data.length > max.data.length ? phase : max
    );

    const analysis = this.analyzeTrend(dominantPhase.data);
    
    // Adjust confidence based on whether trend matches expected phase behavior
    let adjustedConfidence = analysis.confidence;
    if (analysis.trend === dominantPhase.expectedTrend) {
      adjustedConfidence = Math.min(100, adjustedConfidence * 1.2);
    } else if (analysis.trend === "stable") {
      adjustedConfidence = Math.max(adjustedConfidence, 60);
    }

    return {
      ...analysis,
      confidence: Math.round(adjustedConfidence),
    };
  }

  /**
   * Analyze GPS quality trend
   */
  static analyzeGpsTrend(data: TimeSeriesPoint[]): TrendAnalysisResult {
    if (data.length < this.MIN_POINTS) {
      return {
        trend: "stable",
        confidence: 0,
        slope: 0,
        correlation: 0,
      };
    }

    const analysis = this.analyzeTrend(data);
    
    // GPS quality should ideally be stable or improving
    // Declining GPS is concerning
    let adjustedConfidence = analysis.confidence;
    if (analysis.trend === "down") {
      adjustedConfidence = Math.min(100, analysis.confidence * 1.3); // Higher confidence for concerning trends
    }

    return {
      ...analysis,
      confidence: Math.round(adjustedConfidence),
    };
  }

  /**
   * Calculate linear regression for trend analysis
   */
  private static calculateLinearRegression(data: TimeSeriesPoint[]): {
    slope: number;
    intercept: number;
    correlation: number;
  } {
    const n = data.length;
    if (n < 2) {
      return { slope: 0, intercept: 0, correlation: 0 };
    }

    // Use array indices as x values for simplicity (time normalization)
    const x = data.map((_, i) => i);
    const y = data.map(p => p.value);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * (y[i] ?? 0), 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate correlation coefficient
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const correlation = denominator === 0 ? 0 : numerator / denominator;

    return {
      slope: isNaN(slope) ? 0 : slope,
      intercept: isNaN(intercept) ? 0 : intercept,
      correlation: isNaN(correlation) ? 0 : correlation,
    };
  }

  /**
   * Get trend analysis for all dashboard metrics
   */
  static analyzeDashboardTrends(logFileData: {
    batteryStartVoltage?: number;
    batteryEndVoltage?: number;
    flightDuration?: number;
    timeSeriesData?: Array<{
      parameter: string;
      timestamp: number;
      value: number;
    }>;
  }): Record<string, TrendAnalysisResult> {
    const trends: Record<string, TrendAnalysisResult> = {};

    if (!logFileData.timeSeriesData) {
      // Return stable trends if no time series data
      return {
        altitude: { trend: "stable", confidence: 0, slope: 0, correlation: 0 },
        battery: { trend: "stable", confidence: 0, slope: 0, correlation: 0 },
        gps: { trend: "stable", confidence: 0, slope: 0, correlation: 0 },
        duration: { trend: "stable", confidence: 100, slope: 0, correlation: 0 },
        distance: { trend: "stable", confidence: 100, slope: 0, correlation: 0 },
        fileSize: { trend: "stable", confidence: 100, slope: 0, correlation: 0 },
      };
    }

    // Group time series data by parameter
    const parameterData: Record<string, TimeSeriesPoint[]> = {};
    logFileData.timeSeriesData.forEach(point => {
      if (!parameterData[point.parameter]) {
        parameterData[point.parameter] = [];
      }
      parameterData[point.parameter]!.push({
        timestamp: point.timestamp,
        value: point.value,
      });
    });

    // Analyze altitude trend
    if (parameterData['altitude']) {
      trends.altitude = this.analyzeAltitudeTrend(parameterData['altitude']);
    } else {
      trends.altitude = { trend: "stable", confidence: 0, slope: 0, correlation: 0 };
    }

    // Analyze battery trend
    if (logFileData.batteryStartVoltage && logFileData.batteryEndVoltage && logFileData.flightDuration) {
      trends.battery = this.analyzeBatteryTrend(
        logFileData.batteryStartVoltage,
        logFileData.batteryEndVoltage,
        logFileData.flightDuration
      );
    } else if (parameterData && parameterData['battery_voltage']) {
      trends.battery = this.analyzeTrend(parameterData['battery_voltage']);
    } else {
      trends.battery = { trend: "stable", confidence: 0, slope: 0, correlation: 0 };
    }

    // Analyze GPS trend (based on GPS quality if available)
    const gpsData = parameterData['gps_quality'] || parameterData['gps_lat'] || parameterData['gps_lng'];
    if (gpsData) {
      trends.gps = this.analyzeGpsTrend(gpsData);
    } else {
      trends.gps = { trend: "stable", confidence: 50, slope: 0, correlation: 0 };
    }

    // Static metrics (no trend analysis needed, always stable)
    trends.duration = { trend: "stable", confidence: 100, slope: 0, correlation: 0 };
    trends.distance = { trend: "stable", confidence: 100, slope: 0, correlation: 0 };
    trends.fileSize = { trend: "stable", confidence: 100, slope: 0, correlation: 0 };

    return trends;
  }
}