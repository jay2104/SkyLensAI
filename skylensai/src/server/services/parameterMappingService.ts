/**
 * Parameter Mapping Service
 * 
 * Provides a clean 3-layer parameter mapping system:
 * 1. Raw Log Names (from ArduPilot): "CTUN.Alt", "ATT.Roll", etc.
 * 2. Internal API Names (consistent): "ctun_alt", "att_roll", etc.
 * 3. Display Names (user-friendly): "Control Altitude", "Roll Angle", etc.
 * 
 * This replaces the haphazard mapping we had before with a comprehensive
 * system based on official ArduPilot log message definitions.
 */

import { 
  RAW_TO_INTERNAL_MAPPING,
  INTERNAL_TO_DISPLAY_MAPPING,
  getFieldDefinition,
  getCoreParameters,
  getParametersByCategory,
  type LogMessageField
} from './ardupilotLogMessageDefinitions';

export interface ParameterMappingResult {
  /** Original parameter name from log */
  rawName: string;
  /** Consistent internal API name */
  internalName: string;
  /** User-friendly display name */
  displayName: string;
  /** Full field definition with metadata */
  definition: LogMessageField | null;
  /** Whether mapping was successful */
  mapped: boolean;
}

/**
 * Main parameter mapping function
 * Maps raw log parameter names to internal API names
 */
export function mapRawToInternal(rawParameterName: string): string {
  // Normalize the raw parameter name to handle various formats
  const normalized = rawParameterName.toLowerCase();
  
  // Try direct lookup first
  if (RAW_TO_INTERNAL_MAPPING[normalized]) {
    return RAW_TO_INTERNAL_MAPPING[normalized];
  }
  
  // Try with common variations
  const variations = [
    rawParameterName,
    rawParameterName.toLowerCase(),
    rawParameterName.replace(/\./g, '_').toLowerCase(),
    rawParameterName.replace(/-/g, '_').toLowerCase(),
  ];
  
  for (const variation of variations) {
    if (RAW_TO_INTERNAL_MAPPING[variation]) {
      return RAW_TO_INTERNAL_MAPPING[variation];
    }
  }
  
  // If no mapping found, return a normalized version of the original
  return rawParameterName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

/**
 * Map internal API name to user-friendly display name
 */
export function mapInternalToDisplay(internalName: string): string {
  return INTERNAL_TO_DISPLAY_MAPPING[internalName] || formatDisplayName(internalName);
}

/**
 * Get comprehensive parameter mapping information
 */
export function getParameterMapping(rawParameterName: string): ParameterMappingResult {
  const internalName = mapRawToInternal(rawParameterName);
  const displayName = mapInternalToDisplay(internalName);
  const definition = getFieldDefinition(internalName);
  const mapped = definition !== null;
  
  return {
    rawName: rawParameterName,
    internalName,
    displayName,
    definition,
    mapped
  };
}

/**
 * Get parameter mappings for multiple parameters
 */
export function getParameterMappingBatch(rawParameterNames: string[]): ParameterMappingResult[] {
  return rawParameterNames.map(name => getParameterMapping(name));
}

/**
 * Get all available internal parameter names
 */
export function getAllInternalParameterNames(): string[] {
  return Object.values(RAW_TO_INTERNAL_MAPPING);
}

/**
 * Get all core parameters (for preset graphs)
 */
export function getCoreParameterMappings(): ParameterMappingResult[] {
  const coreParams = getCoreParameters();
  return coreParams.map(param => ({
    rawName: param.rawName,
    internalName: param.internalName,
    displayName: param.displayName,
    definition: param,
    mapped: true
  }));
}

/**
 * Get parameters by category
 */
export function getParameterMappingsByCategory(category: string): ParameterMappingResult[] {
  const params = getParametersByCategory(category);
  return params.map(param => ({
    rawName: param.rawName,
    internalName: param.internalName,
    displayName: param.displayName,
    definition: param,
    mapped: true
  }));
}

/**
 * Check if a parameter is mapped to our system
 */
export function isParameterMapped(rawParameterName: string): boolean {
  const internalName = mapRawToInternal(rawParameterName);
  return getFieldDefinition(internalName) !== null;
}

/**
 * Reverse mapping: find raw parameter names that map to an internal name
 */
export function findRawNamesForInternal(internalName: string): string[] {
  const rawNames: string[] = [];
  
  for (const [rawName, mappedInternal] of Object.entries(RAW_TO_INTERNAL_MAPPING)) {
    if (mappedInternal === internalName) {
      rawNames.push(rawName);
    }
  }
  
  return rawNames;
}

/**
 * Create a display-friendly parameter name when no mapping exists
 */
function formatDisplayName(internalName: string): string {
  return internalName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get parameter statistics for debugging
 */
export function getParameterMappingStats(): {
  totalMappings: number;
  coreParameters: number;
  categories: Record<string, number>;
  messageTypes: string[];
} {
  const coreParams = getCoreParameters();
  const categories: Record<string, number> = {};
  
  // Count parameters by category
  Object.values(INTERNAL_TO_DISPLAY_MAPPING).forEach(() => {
    // This would need to be enhanced to track categories properly
  });
  
  return {
    totalMappings: Object.keys(RAW_TO_INTERNAL_MAPPING).length,
    coreParameters: coreParams.length,
    categories,
    messageTypes: ['ATT', 'CTUN', 'GPS', 'IMU', 'BARO', 'CURR', 'RCOU', 'RCIN', 'VIBE']
  };
}

/**
 * Validate time series data against parameter mappings
 */
export function validateTimeSeriesData(timeSeriesData: Record<string, any[]>): {
  mapped: string[];
  unmapped: string[];
  total: number;
  mappingRate: number;
} {
  const dataKeys = Object.keys(timeSeriesData);
  const mapped: string[] = [];
  const unmapped: string[] = [];
  
  dataKeys.forEach(key => {
    if (isParameterMapped(key)) {
      mapped.push(key);
    } else {
      unmapped.push(key);
    }
  });
  
  return {
    mapped,
    unmapped,
    total: dataKeys.length,
    mappingRate: mapped.length / dataKeys.length
  };
}

// Export commonly used mappings as constants for performance
export { RAW_TO_INTERNAL_MAPPING, INTERNAL_TO_DISPLAY_MAPPING };