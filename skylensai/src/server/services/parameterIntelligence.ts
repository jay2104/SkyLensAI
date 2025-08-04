/**
 * AI-Powered Parameter Intelligence Service
 * Automatically infers parameter meanings, display names, and categorization
 * Phase 1.1: Dynamic dashboard that works with any parameter names
 */

import OpenAI from 'openai';

export interface ParameterMetadata {
  parameter: string;
  displayName: string;
  category: string;
  description: string;
  priority: number; // 1-5, higher = more important for dashboard
  unit: string;
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  colorHint: string; // CSS color or color family
  isCore: boolean; // true for essential flight parameters
}

export interface ParameterCategory {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  parameters: ParameterMetadata[];
  priority: number;
}

export class ParameterIntelligenceService {
  private static openai: OpenAI | null = null;
  private static parameterCache = new Map<string, ParameterMetadata>();
  
  /**
   * Initialize OpenAI client
   */
  private static getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  /**
   * Analyze and enhance parameter metadata using AI
   */
  static async analyzeParameters(
    parameters: Array<{ parameter: string; unit: string; sampleValues?: number[] }>
  ): Promise<ParameterMetadata[]> {
    console.log(`🧠 AI Parameter Analysis: Processing ${parameters.length} parameters`);
    
    // Create batches for efficient AI processing (10 parameters per batch)
    const batches = this.createBatches(parameters, 10);
    const results: ParameterMetadata[] = [];
    
    for (const batch of batches) {
      const batchResults = await this.analyzeBatch(batch);
      results.push(...batchResults);
    }
    
    console.log(`✅ AI Parameter Analysis: Generated metadata for ${results.length} parameters`);
    return results;
  }

  /**
   * Analyze a batch of parameters with AI
   */
  private static async analyzeBatch(
    parameters: Array<{ parameter: string; unit: string; sampleValues?: number[] }>
  ): Promise<ParameterMetadata[]> {
    try {
      const openai = this.getOpenAI();
      
      const prompt = this.buildAnalysisPrompt(parameters);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert in drone/UAV telemetry and flight log analysis. Your job is to analyze technical parameter names and provide human-readable metadata for a flight analysis dashboard.

IMPORTANT: You must respond with ONLY a valid JSON array, no markdown formatting, no explanatory text.

For each parameter, determine:
1. Display Name: Human-readable name (e.g., "baro_alt" → "Barometric Altitude")
2. Category: One of [Flight_Dynamics, Power_Systems, Navigation, Control_Inputs, Sensors, System_Health, Environmental]
3. Description: Brief technical description
4. Priority: 1-5 (5=critical flight parameter, 1=diagnostic only)
5. Chart Type: line, area, bar, or scatter
6. Color Hint: CSS color name or hex (based on parameter type)
7. Is Core: true for essential flight safety parameters`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse AI response
      const aiResults = JSON.parse(content) as Array<{
        parameter: string;
        displayName: string;
        category: string;
        description: string;
        priority: number;
        chartType: 'line' | 'area' | 'bar' | 'scatter';
        colorHint: string;
        isCore: boolean;
      }>;

      // Convert to ParameterMetadata with fallbacks
      return aiResults.map((ai, index) => {
        const original = parameters[index];
        if (!original) {
          throw new Error(`Missing original parameter for AI result ${index}`);
        }

        return {
          parameter: original.parameter,
          displayName: ai.displayName || this.fallbackDisplayName(original.parameter),
          category: ai.category || 'System_Health',
          description: ai.description || `${original.parameter} telemetry data`,
          priority: ai.priority || 3,
          unit: original.unit,
          chartType: ai.chartType || 'line',
          colorHint: ai.colorHint || this.fallbackColor(ai.category),
          isCore: ai.isCore || false
        };
      });

    } catch (error) {
      console.warn(`⚠️ AI analysis failed, using fallbacks:`, error);
      return this.generateFallbackMetadata(parameters);
    }
  }

  /**
   * Build analysis prompt for AI
   */
  private static buildAnalysisPrompt(
    parameters: Array<{ parameter: string; unit: string; sampleValues?: number[] }>
  ): string {
    const paramList = parameters.map(p => {
      const sampleInfo = p.sampleValues 
        ? ` (samples: ${p.sampleValues.slice(0, 3).join(', ')})` 
        : '';
      return `"${p.parameter}" (${p.unit})${sampleInfo}`;
    }).join('\n');

    return `Analyze these drone telemetry parameters and return metadata as JSON:

${paramList}

Return JSON array with this exact structure:
[
  {
    "parameter": "exact_parameter_name",
    "displayName": "Human Readable Name", 
    "category": "Flight_Dynamics|Power_Systems|Navigation|Control_Inputs|Sensors|System_Health|Environmental",
    "description": "Brief technical description",
    "priority": 1-5,
    "chartType": "line|area|bar|scatter",
    "colorHint": "CSS color name or hex",
    "isCore": true/false
  }
]`;
  }

  /**
   * Generate fallback metadata when AI is unavailable
   */
  private static generateFallbackMetadata(
    parameters: Array<{ parameter: string; unit: string }>
  ): ParameterMetadata[] {
    return parameters.map(p => ({
      parameter: p.parameter,
      displayName: this.fallbackDisplayName(p.parameter),
      category: this.inferCategory(p.parameter),
      description: `${p.parameter} telemetry measurement`,
      priority: this.inferPriority(p.parameter),
      unit: p.unit,
      chartType: 'line' as const,
      colorHint: this.fallbackColor(this.inferCategory(p.parameter)),
      isCore: this.isCorePrimitive(p.parameter)
    }));
  }

  /**
   * Organize parameters into intelligent categories
   */
  static categorizeParameters(parameters: ParameterMetadata[]): ParameterCategory[] {
    const categoryMap = new Map<string, ParameterMetadata[]>();
    
    // Group parameters by category
    parameters.forEach(param => {
      const category = param.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(param);
    });

    // Convert to ParameterCategory objects with metadata
    const categories: ParameterCategory[] = [];
    
    categoryMap.forEach((params, categoryName) => {
      // Sort parameters by priority within category
      params.sort((a, b) => b.priority - a.priority);
      
      categories.push({
        name: categoryName,
        displayName: this.getCategoryDisplayName(categoryName),
        description: this.getCategoryDescription(categoryName),
        icon: this.getCategoryIcon(categoryName),
        parameters: params,
        priority: this.getCategoryPriority(categoryName)
      });
    });

    // Sort categories by priority
    categories.sort((a, b) => b.priority - a.priority);
    
    return categories;
  }

  /**
   * Create processing batches
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Fallback display name generation
   */
  private static fallbackDisplayName(parameter: string): string {
    return parameter
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Infer category from parameter name
   */
  private static inferCategory(parameter: string): string {
    const p = parameter.toLowerCase();
    
    if (p.includes('gps') || p.includes('lat') || p.includes('lng') || p.includes('hdop')) return 'Navigation';
    if (p.includes('battery') || p.includes('volt') || p.includes('curr') || p.includes('power')) return 'Power_Systems';
    if (p.includes('roll') || p.includes('pitch') || p.includes('yaw') || p.includes('alt')) return 'Flight_Dynamics';
    if (p.includes('rc_') || p.includes('servo') || p.includes('motor')) return 'Control_Inputs';
    if (p.includes('imu') || p.includes('mag') || p.includes('baro') || p.includes('temp')) return 'Sensors';
    if (p.includes('pm_') || p.includes('load') || p.includes('mem')) return 'System_Health';
    
    return 'System_Health';
  }

  /**
   * Infer priority from parameter name
   */
  private static inferPriority(parameter: string): number {
    const p = parameter.toLowerCase();
    
    // Critical flight safety parameters
    if (p.includes('alt') || p.includes('battery') || p.includes('gps')) return 5;
    // Important flight dynamics
    if (p.includes('roll') || p.includes('pitch') || p.includes('yaw')) return 4;
    // Control and navigation
    if (p.includes('rc_') || p.includes('servo') || p.includes('motor')) return 3;
    // Sensors and diagnostics
    if (p.includes('imu') || p.includes('mag') || p.includes('baro')) return 2;
    // System diagnostics
    return 1;
  }

  /**
   * Check if parameter is core flight parameter
   */
  private static isCorePrimitive(parameter: string): boolean {
    const coreParams = ['alt', 'battery', 'gps', 'roll', 'pitch', 'yaw', 'volt', 'curr'];
    return coreParams.some(core => parameter.toLowerCase().includes(core));
  }

  /**
   * Get category display information
   */
  private static getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      'Flight_Dynamics': 'Flight Dynamics',
      'Power_Systems': 'Power Systems', 
      'Navigation': 'Navigation & GPS',
      'Control_Inputs': 'Control Inputs',
      'Sensors': 'Sensors',
      'System_Health': 'System Health',
      'Environmental': 'Environmental'
    };
    return names[category] || category.replace(/_/g, ' ');
  }

  private static getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'Flight_Dynamics': 'Aircraft movement, attitude, and flight performance',
      'Power_Systems': 'Battery, current consumption, and power management',
      'Navigation': 'GPS positioning, heading, and navigation data',
      'Control_Inputs': 'RC inputs, servo outputs, and motor commands',
      'Sensors': 'IMU, magnetometer, barometer, and sensor readings',
      'System_Health': 'CPU load, memory usage, and system diagnostics',
      'Environmental': 'Temperature, pressure, and environmental conditions'
    };
    return descriptions[category] || 'System telemetry data';
  }

  private static getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Flight_Dynamics': 'Activity',
      'Power_Systems': 'Battery',
      'Navigation': 'Navigation',
      'Control_Inputs': 'Settings',
      'Sensors': 'Radar',
      'System_Health': 'BarChart3',
      'Environmental': 'Thermometer'
    };
    return icons[category] || 'BarChart3';
  }

  private static getCategoryPriority(category: string): number {
    const priorities: Record<string, number> = {
      'Flight_Dynamics': 5,
      'Power_Systems': 4,
      'Navigation': 4,
      'Control_Inputs': 3,
      'Sensors': 2,
      'System_Health': 1,
      'Environmental': 1
    };
    return priorities[category] || 1;
  }

  /**
   * Fallback color assignment
   */
  private static fallbackColor(category: string): string {
    const colors: Record<string, string> = {
      'Flight_Dynamics': '#3b82f6', // blue
      'Power_Systems': '#ef4444',   // red
      'Navigation': '#10b981',      // emerald
      'Control_Inputs': '#f59e0b',  // amber
      'Sensors': '#8b5cf6',         // violet
      'System_Health': '#6b7280',   // gray
      'Environmental': '#06b6d4'    // cyan
    };
    return colors[category] || '#6b7280';
  }
}