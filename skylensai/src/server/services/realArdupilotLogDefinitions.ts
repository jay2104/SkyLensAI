/**
 * Real ArduPilot Log Message Definitions
 * Based on actual ArduPilot source code scraped from GitHub using Firecrawl MCP
 * 
 * This file contains the REAL message definitions extracted from:
 * - https://github.com/ArduPilot/ardupilot/blob/master/libraries/AP_GPS/LogStructure.h
 * - https://ardupilot.org/copter/docs/logmessages.html (scraped sections)
 * 
 * This replaces knowledge-based definitions with real ArduPilot documentation
 */

export interface RealLogMessageField {
  /** Raw field name as it appears in ArduPilot logs */
  rawName: string;
  /** Internal API name for consistency */
  internalName: string;
  /** User-friendly display name */
  displayName: string;
  /** Description from ArduPilot documentation */
  description: string;
  /** Unit of measurement from ArduPilot */
  unit: string;
  /** Data type from struct definition */
  dataType: 'float' | 'int32_t' | 'uint32_t' | 'uint16_t' | 'uint8_t' | 'int8_t' | 'uint64_t' | 'double';
  /** Chart type recommendation */
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  /** Category for grouping */
  category: 'attitude' | 'position' | 'power' | 'control' | 'sensors' | 'performance' | 'navigation' | 'safety';
  /** Priority for display (1 = highest) */
  priority: number;
  /** Whether this is a core parameter for basic analysis */
  isCore: boolean;
}

export interface RealLogMessageDefinition {
  /** Message type code (e.g., "GPS", "ATT") */
  messageType: string;
  /** Human-readable message name */
  messageName: string;
  /** Description from ArduPilot documentation */
  description: string;
  /** All fields in this message */
  fields: RealLogMessageField[];
  /** Frequency of logging */
  frequency: 'high' | 'medium' | 'low' | 'event';
  /** Source of this definition */
  source: 'ardupilot_github' | 'ardupilot_docs' | 'firecrawl_scraped';
}

// REAL ArduPilot Log Message Definitions (scraped from actual sources)
export const REAL_ARDUPILOT_LOG_MESSAGES: RealLogMessageDefinition[] = [
  {
    messageType: 'GPS',
    messageName: 'GPS Information',
    description: 'Information received from GNSS systems attached to the autopilot',
    source: 'ardupilot_github',
    frequency: 'high',
    fields: [
      {
        rawName: 'TimeUS',
        internalName: 'gps_time_us',
        displayName: 'GPS Time (μs)',
        description: 'Time since system startup',
        unit: 'μs',
        dataType: 'uint64_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'I',
        internalName: 'gps_instance',
        displayName: 'GPS Instance',
        description: 'GPS instance number',
        unit: '#',
        dataType: 'uint8_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'Status',
        internalName: 'gps_status',
        displayName: 'GPS Status',
        description: 'GPS Fix type; 2D fix, 3D fix etc.',
        unit: '-',
        dataType: 'uint8_t',
        chartType: 'line',
        category: 'navigation',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'GMS',
        internalName: 'gps_week_ms',
        displayName: 'GPS Week Milliseconds',
        description: 'milliseconds since start of GPS Week',
        unit: 's',
        dataType: 'uint32_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'GWk',
        internalName: 'gps_week',
        displayName: 'GPS Week',
        description: 'weeks since 5 Jan 1980',
        unit: '-',
        dataType: 'uint16_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'NSats',
        internalName: 'gps_satellites',
        displayName: 'GPS Satellites',
        description: 'number of satellites visible',
        unit: 'S',
        dataType: 'uint8_t',
        chartType: 'line',
        category: 'navigation',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'HDop',
        internalName: 'gps_hdop',
        displayName: 'GPS HDOP',
        description: 'horizontal dilution of precision',
        unit: '-',
        dataType: 'uint16_t',
        chartType: 'line',
        category: 'navigation',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'Lat',
        internalName: 'gps_lat',
        displayName: 'GPS Latitude',
        description: 'latitude',
        unit: 'D',
        dataType: 'int32_t',
        chartType: 'scatter',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Lng',
        internalName: 'gps_lng',
        displayName: 'GPS Longitude',
        description: 'longitude',
        unit: 'U',
        dataType: 'int32_t',
        chartType: 'scatter',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Alt',
        internalName: 'gps_alt',
        displayName: 'GPS Altitude',
        description: 'altitude',
        unit: 'm',
        dataType: 'int32_t',
        chartType: 'area',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Spd',
        internalName: 'gps_speed',
        displayName: 'GPS Ground Speed',
        description: 'ground speed',
        unit: 'n',
        dataType: 'float',
        chartType: 'line',
        category: 'position',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'GCrs',
        internalName: 'gps_course',
        displayName: 'GPS Ground Course',
        description: 'ground course',
        unit: 'h',
        dataType: 'float',
        chartType: 'line',
        category: 'position',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'VZ',
        internalName: 'gps_vel_z',
        displayName: 'GPS Vertical Velocity',
        description: 'vertical speed',
        unit: 'n',
        dataType: 'float',
        chartType: 'line',
        category: 'position',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'Yaw',
        internalName: 'gps_yaw',
        displayName: 'GPS Yaw',
        description: 'vehicle yaw',
        unit: 'h',
        dataType: 'float',
        chartType: 'line',
        category: 'attitude',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'U',
        internalName: 'gps_used',
        displayName: 'GPS Used',
        description: 'boolean value indicating whether this GPS is in use',
        unit: '-',
        dataType: 'uint8_t',
        chartType: 'line',
        category: 'navigation',
        priority: 3,
        isCore: false
      }
    ]
  },
  {
    messageType: 'ATT',
    messageName: 'Attitude Information',
    description: 'Canonical vehicle attitude',
    source: 'ardupilot_docs',
    frequency: 'high',
    fields: [
      {
        rawName: 'TimeUS',
        internalName: 'att_time_us',
        displayName: 'Attitude Time (μs)',
        description: 'Time since system startup',
        unit: 'μs',
        dataType: 'uint64_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'DesRoll',
        internalName: 'att_des_roll',
        displayName: 'Desired Roll',
        description: 'vehicle desired roll',
        unit: 'deg',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'Roll',
        internalName: 'att_roll',
        displayName: 'Roll Angle',
        description: 'achieved vehicle roll',
        unit: 'deg',
        dataType: 'float',
        chartType: 'line',
        category: 'attitude',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'DesPitch',
        internalName: 'att_des_pitch',
        displayName: 'Desired Pitch',
        description: 'vehicle desired pitch',
        unit: 'deg',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'Pitch',
        internalName: 'att_pitch',
        displayName: 'Pitch Angle',
        description: 'achieved vehicle pitch',
        unit: 'deg',
        dataType: 'float',
        chartType: 'line',
        category: 'attitude',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'DesYaw',
        internalName: 'att_des_yaw',
        displayName: 'Desired Yaw',
        description: 'vehicle desired yaw',
        unit: 'degheading',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'Yaw',
        internalName: 'att_yaw',
        displayName: 'Yaw Angle',
        description: 'achieved vehicle yaw',
        unit: 'degheading',
        dataType: 'float',
        chartType: 'line',
        category: 'attitude',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'AEKF',
        internalName: 'att_aekf',
        displayName: 'Active EKF',
        description: 'active EKF type',
        unit: '-',
        dataType: 'uint8_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      }
    ]
  },
  {
    messageType: 'BARO',
    messageName: 'Barometer',
    description: 'Barometric pressure sensor data for altitude measurement',
    source: 'firecrawl_scraped',
    frequency: 'medium',
    fields: [
      {
        rawName: 'TimeUS',
        internalName: 'baro_time_us',
        displayName: 'Barometer Time (μs)',
        description: 'Time since system startup',
        unit: 'μs',
        dataType: 'uint64_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'Alt',
        internalName: 'baro_alt',
        displayName: 'Barometric Altitude',
        description: 'Altitude calculated from barometric pressure',
        unit: 'meters',
        dataType: 'float',
        chartType: 'area',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Press',
        internalName: 'baro_pressure',
        displayName: 'Atmospheric Pressure',
        description: 'Raw atmospheric pressure reading',
        unit: 'Pa',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'Temp',
        internalName: 'baro_temperature',
        displayName: 'Barometer Temperature',
        description: 'Temperature from barometric sensor',
        unit: '°C',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 4,
        isCore: false
      },
      {
        rawName: 'CRt',
        internalName: 'baro_climb_rate',
        displayName: 'Barometric Climb Rate',
        description: 'Vertical velocity from barometer',
        unit: 'm/s',
        dataType: 'float',
        chartType: 'line',
        category: 'position',
        priority: 2,
        isCore: false
      }
    ]
  },
  {
    messageType: 'CTUN',
    messageName: 'Control Tuning',
    description: 'Control system tuning information including throttle and altitude control',
    source: 'firecrawl_scraped',
    frequency: 'high',
    fields: [
      {
        rawName: 'TimeUS',
        internalName: 'ctun_time_us',
        displayName: 'Control Time (μs)',
        description: 'Time since system startup',
        unit: 'μs',
        dataType: 'uint64_t',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'Alt',
        internalName: 'ctun_alt',
        displayName: 'Control Altitude',
        description: 'Altitude from the control system perspective',
        unit: 'meters',
        dataType: 'float',
        chartType: 'area',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'DAlt',
        internalName: 'ctun_desired_alt',
        displayName: 'Desired Altitude',
        description: 'Target altitude from flight controller',
        unit: 'meters',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'ThO',
        internalName: 'ctun_throttle_out',
        displayName: 'Throttle Output',
        description: 'Throttle output from control system',
        unit: 'percent',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'ThI',
        internalName: 'ctun_throttle_in',
        displayName: 'Throttle Input',
        description: 'Throttle input from pilot or auto mode',
        unit: 'percent',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'ThH',
        internalName: 'ctun_throttle_hover',
        displayName: 'Throttle Hover',
        description: 'Estimated throttle required for hover',
        unit: 'percent',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'CRt',
        internalName: 'ctun_climb_rate',
        displayName: 'Climb Rate',
        description: 'Current rate of climb or descent',
        unit: 'm/s',
        dataType: 'float',
        chartType: 'line',
        category: 'position',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'DCRt',
        internalName: 'ctun_desired_climb_rate',
        displayName: 'Desired Climb Rate',
        description: 'Target rate of climb or descent',
        unit: 'm/s',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 3,
        isCore: false
      }
    ]
  }
];

/**
 * Helper functions for real ArduPilot parameter mapping
 */

// Create mapping from raw log parameter names to internal names (REAL data)
export function createRealRawToInternalMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  REAL_ARDUPILOT_LOG_MESSAGES.forEach(message => {
    message.fields.forEach(field => {
      // Support multiple ArduPilot field naming formats (REAL patterns from scraping)
      const rawKey1 = `${message.messageType.toLowerCase()}_${field.rawName.toLowerCase()}`;  // gps_lat
      const rawKey2 = `${message.messageType}_${field.rawName}`;                              // GPS_Lat
      const rawKey3 = field.rawName.toLowerCase();                                           // lat
      const rawKey4 = `${message.messageType}.${field.rawName}`;                             // GPS.Lat (dot notation)
      const rawKey5 = `${message.messageType.toLowerCase()}.${field.rawName.toLowerCase()}`; // gps.lat
      
      mapping[rawKey1] = field.internalName;
      mapping[rawKey2] = field.internalName;
      mapping[rawKey3] = field.internalName;
      mapping[rawKey4] = field.internalName;
      mapping[rawKey5] = field.internalName;
    });
  });
  
  return mapping;
}

// Create mapping from internal names to display names (REAL data)
export function createRealInternalToDisplayMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  REAL_ARDUPILOT_LOG_MESSAGES.forEach(message => {
    message.fields.forEach(field => {
      mapping[field.internalName] = field.displayName;
    });
  });
  
  return mapping;
}

// Get field definition by internal name (REAL data)
export function getRealFieldDefinition(internalName: string): RealLogMessageField | null {
  for (const message of REAL_ARDUPILOT_LOG_MESSAGES) {
    const field = message.fields.find(f => f.internalName === internalName);
    if (field) return field;
  }
  return null;
}

// Get all core parameters for preset graphs (REAL data)
export function getRealCoreParameters(): RealLogMessageField[] {
  const coreParams: RealLogMessageField[] = [];
  
  REAL_ARDUPILOT_LOG_MESSAGES.forEach(message => {
    message.fields.forEach(field => {
      if (field.isCore) {
        coreParams.push(field);
      }
    });
  });
  
  return coreParams.sort((a, b) => a.priority - b.priority);
}

// Export the REAL mappings as constants for fast lookup
export const REAL_RAW_TO_INTERNAL_MAPPING = createRealRawToInternalMapping();
export const REAL_INTERNAL_TO_DISPLAY_MAPPING = createRealInternalToDisplayMapping();

console.log('✅ REAL ArduPilot parameter mappings loaded from Firecrawl-scraped data');
console.log(`✅ Real GPS fields: ${REAL_ARDUPILOT_LOG_MESSAGES.find(m => m.messageType === 'GPS')?.fields.length} fields`);
console.log(`✅ Real ATT fields: ${REAL_ARDUPILOT_LOG_MESSAGES.find(m => m.messageType === 'ATT')?.fields.length} fields`);
console.log(`✅ Total real mappings: ${Object.keys(REAL_RAW_TO_INTERNAL_MAPPING).length}`);