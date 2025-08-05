/**
 * Documentation-Based Parameter Intelligence Service
 * Replaces AI-based parameter analysis with comprehensive ArduPilot documentation
 */

import { 
  PARAMETER_CATEGORIES, 
  getParametersByCategory, 
  getCoreParameters,
  type ParameterDefinition 
} from './ardupilotParameterDefinitions';
import { getEnhancedParameterInfoBatch, type EnhancedParameterInfo } from './parameterMapping';

export interface ParameterCategory {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  parameters: ParameterMetadata[];
  priority: number;
}

export interface ParameterMetadata {
  parameter: string;
  displayName: string;
  category: string;
  description: string;
  priority: number;
  unit: string;
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  colorHint: string;
  isCore: boolean;
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
  count: number; // Number of data points
}

export interface ParameterAnalysisResult {
  categories: ParameterCategory[];
  totalParameters: number;
  documentationBased: true;
  coreParameterCount: number;
  categoryStats: Record<string, number>;
}

export class DocumentationBasedParameterService {
  /**
   * Analyze parameters using comprehensive ArduPilot documentation
   */
  static analyzeParameters(
    parameterData: Array<{
      parameter: string;
      unit: string;
      count: number;
      sampleValues?: number[];
    }>
  ): ParameterAnalysisResult {
    console.log('[DocumentationBasedParameterService] Analyzing parameters using ArduPilot documentation');
    
    // Get enhanced parameter information for all parameters
    const enhancedParams = getEnhancedParameterInfoBatch(
      parameterData.map(p => p.parameter)
    );

    // Create parameter metadata with original units where available
    const parameterMetadata: ParameterMetadata[] = enhancedParams.map((enhanced, index) => {
      const originalData = parameterData[index];
      return {
        parameter: enhanced.standardizedName,
        displayName: enhanced.definition.displayName,
        category: enhanced.definition.category,
        description: enhanced.definition.description,
        priority: enhanced.definition.priority,
        unit: originalData?.unit || enhanced.definition.unit, // Prefer actual log file unit
        chartType: enhanced.definition.chartType,
        colorHint: enhanced.definition.color,
        isCore: enhanced.definition.isCore,
        minValue: enhanced.definition.minValue,
        maxValue: enhanced.definition.maxValue,
        decimalPlaces: enhanced.definition.decimalPlaces,
        count: originalData?.count || 0 // Include data point count
      };
    });

    // Group parameters by category
    const categorizedParams = this.categorizeParameters(parameterMetadata);
    
    // Calculate statistics
    const categoryStats: Record<string, number> = {};
    const coreParameterCount = parameterMetadata.filter(p => p.isCore).length;
    
    categorizedParams.forEach(category => {
      categoryStats[category.name] = category.parameters.length;
    });

    console.log(`[DocumentationBasedParameterService] Analysis complete:`, {
      totalParameters: parameterMetadata.length,
      coreParameters: coreParameterCount,
      categories: categorizedParams.length,
      categoryBreakdown: categoryStats
    });

    return {
      categories: categorizedParams,
      totalParameters: parameterMetadata.length,
      documentationBased: true,
      coreParameterCount,
      categoryStats
    };
  }

  /**
   * Organize parameters into intelligent categories based on ArduPilot documentation
   */
  static categorizeParameters(parameters: ParameterMetadata[]): ParameterCategory[] {
    // Group parameters by category
    const categoryGroups: Record<string, ParameterMetadata[]> = {};
    
    parameters.forEach(param => {
      if (!categoryGroups[param.category]) {
        categoryGroups[param.category] = [];
      }
      categoryGroups[param.category]!.push(param);
    });

    // Create category objects with metadata
    const categories: ParameterCategory[] = [];
    
    Object.entries(categoryGroups).forEach(([categoryName, categoryParams]) => {
      const categoryDef = PARAMETER_CATEGORIES[categoryName];
      
      if (categoryDef) {
        // Sort parameters by priority (high to low), then by core status, then alphabetically
        const sortedParams = categoryParams.sort((a, b) => {
          if (a.priority !== b.priority) return b.priority - a.priority;
          if (a.isCore !== b.isCore) return a.isCore ? -1 : 1;
          return a.displayName.localeCompare(b.displayName);
        });

        categories.push({
          name: categoryDef.name,
          displayName: categoryDef.displayName,
          description: categoryDef.description,
          icon: categoryDef.icon,
          parameters: sortedParams,
          priority: categoryDef.priority
        });
      }
    });

    // Sort categories by priority, then by parameter count
    return categories.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.parameters.length - a.parameters.length;
    });
  }

  /**
   * Get recommended chart configuration for a parameter
   */
  static getChartConfiguration(parameterName: string): {
    chartType: 'line' | 'area' | 'bar' | 'scatter';
    color: string;
    yAxisConfig: {
      min?: number;
      max?: number;
      label: string;
      decimalPlaces: number;
    };
  } {
    const enhanced = getEnhancedParameterInfoBatch([parameterName])[0];
    
    if (!enhanced) {
      return {
        chartType: 'line',
        color: '#64748b',
        yAxisConfig: {
          label: 'Value',
          decimalPlaces: 2
        }
      };
    }

    const def = enhanced.definition;
    
    return {
      chartType: def.chartType,
      color: def.color,
      yAxisConfig: {
        min: def.minValue,
        max: def.maxValue,
        label: def.unit === 'unknown' ? 'Value' : def.unit,
        decimalPlaces: def.decimalPlaces || 2
      }
    };
  }

  /**
   * Get human-readable summary of parameter analysis
   */
  static getAnalysisSummary(result: ParameterAnalysisResult): string {
    const corePercentage = Math.round((result.coreParameterCount / result.totalParameters) * 100);
    const topCategories = Object.entries(result.categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat, count]) => `${PARAMETER_CATEGORIES[cat]?.displayName || cat}: ${count}`)
      .join(', ');

    return `Analyzed ${result.totalParameters} parameters using ArduPilot documentation. ` +
           `${result.coreParameterCount} core flight parameters identified (${corePercentage}%). ` +
           `Top categories: ${topCategories}.`;
  }

  /**
   * Validate parameter data quality and suggest improvements
   */
  static validateParameterData(
    parameterData: Array<{
      parameter: string;
      unit: string;
      sampleValues?: number[];
    }>
  ): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for core parameters
    const enhancedParams = getEnhancedParameterInfoBatch(
      parameterData.map(p => p.parameter)
    );
    
    const coreParams = enhancedParams.filter(p => p.definition.isCore);
    const expectedCoreParams = getCoreParameters();
    
    if (coreParams.length < expectedCoreParams.length * 0.5) {
      warnings.push(`Only ${coreParams.length} of ${expectedCoreParams.length} expected core parameters found`);
      suggestions.push('Check if log file contains complete flight data');
    }

    // Check for unit consistency
    const unitMismatches = parameterData.filter(p => {
      const enhanced = enhancedParams.find(e => e.originalName === p.parameter);
      return enhanced && 
             enhanced.definition.unit !== 'unknown' && 
             p.unit !== enhanced.definition.unit &&
             p.unit !== 'unknown';
    });

    if (unitMismatches.length > 0) {
      warnings.push(`${unitMismatches.length} parameters have unexpected units`);
      suggestions.push('Verify parameter extraction is correctly parsing units from log file');
    }

    // Check for reasonable sample values
    const valueOutliers = parameterData.filter(p => {
      const enhanced = enhancedParams.find(e => e.originalName === p.parameter);
      if (!enhanced || !p.sampleValues || !enhanced.definition.minValue || !enhanced.definition.maxValue) {
        return false;
      }
      
      return p.sampleValues.some(val => 
        val < enhanced.definition.minValue! || val > enhanced.definition.maxValue!
      );
    });

    if (valueOutliers.length > 0) {
      warnings.push(`${valueOutliers.length} parameters have values outside expected ranges`);
      suggestions.push('Check for sensor calibration issues or data corruption');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }
}

// Export the service for backwards compatibility with existing API
export const ParameterIntelligenceService = DocumentationBasedParameterService;