/**
 * ArduPilot Log Message Definitions
 * Based on official ArduPilot documentation and source code
 * 
 * This creates a proper 3-layer mapping system:
 * 1. Raw Log Names (from ArduPilot logs): CTUN.Alt, ATT.Roll, etc.
 * 2. Internal API Names (consistent): ctun_alt, att_roll, etc. 
 * 3. Display Names (user-friendly): "Control Altitude", "Roll Angle", etc.
 * 
 * References:
 * - https://ardupilot.org/copter/docs/logmessages.html
 * - https://ardupilot.org/plane/docs/logmessages.html
 * - https://github.com/ArduPilot/ardupilot/blob/master/ArduCopter/Log.cpp
 */

export interface LogMessageField {
  /** Raw field name as it appears in logs (e.g., "Alt", "Roll") */
  rawName: string;
  /** Internal API name for consistency (e.g., "ctun_alt", "att_roll") */
  internalName: string;
  /** User-friendly display name (e.g., "Control Altitude", "Roll Angle") */
  displayName: string;
  /** Description of what this field represents */
  description: string;
  /** Unit of measurement */
  unit: string;
  /** Data type for validation */
  dataType: 'float' | 'int' | 'string' | 'bool';
  /** Chart type recommendation */
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  /** Category for grouping */
  category: 'attitude' | 'position' | 'power' | 'control' | 'sensors' | 'performance' | 'navigation' | 'safety';
  /** Priority for display (1 = highest) */
  priority: number;
  /** Whether this is a core parameter for basic analysis */
  isCore: boolean;
}

export interface LogMessageDefinition {
  /** Message type code (e.g., "ATT", "CTUN") */
  messageType: string;
  /** Human-readable message name */
  messageName: string;
  /** Description of this message type */
  description: string;
  /** Vehicle types that use this message */
  vehicleTypes: string[];
  /** All fields in this message */
  fields: LogMessageField[];
  /** Category for grouping messages */
  category: 'attitude' | 'position' | 'power' | 'control' | 'sensors' | 'performance' | 'navigation' | 'safety';
  /** How often this message is logged */
  frequency: 'high' | 'medium' | 'low' | 'event';
}

// Core ArduPilot Log Message Definitions
export const ARDUPILOT_LOG_MESSAGES: LogMessageDefinition[] = [
  {
    messageType: 'ATT',
    messageName: 'Attitude Information',
    description: 'Vehicle attitude (roll, pitch, yaw) and desired attitude values',
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'attitude',
    frequency: 'high',
    fields: [
      {
        rawName: 'Roll',
        internalName: 'att_roll',
        displayName: 'Roll Angle',
        description: 'Current roll attitude of the vehicle',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'line',
        category: 'attitude',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Pitch',
        internalName: 'att_pitch',
        displayName: 'Pitch Angle',
        description: 'Current pitch attitude of the vehicle',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'line',
        category: 'attitude',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Yaw',
        internalName: 'att_yaw',
        displayName: 'Yaw Angle',
        description: 'Current yaw attitude (heading) of the vehicle',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'line',
        category: 'attitude',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'DesRoll',
        internalName: 'att_des_roll',
        displayName: 'Desired Roll',
        description: 'Desired roll attitude from flight controller',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'DesPitch',
        internalName: 'att_des_pitch',
        displayName: 'Desired Pitch',
        description: 'Desired pitch attitude from flight controller',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'DesYaw',
        internalName: 'att_des_yaw',
        displayName: 'Desired Yaw',
        description: 'Desired yaw attitude from flight controller',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      }
    ]
  },
  {
    messageType: 'CTUN',
    messageName: 'Control Tuning',
    description: 'Control system tuning information including throttle and altitude control',
    vehicleTypes: ['copter'],
    category: 'control',
    frequency: 'high',
    fields: [
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
  },
  {
    messageType: 'GPS',
    messageName: 'GPS Information',
    description: 'Global Positioning System data including location, accuracy, and satellite information',
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'navigation',
    frequency: 'high',
    fields: [
      {
        rawName: 'Lat',
        internalName: 'gps_lat',
        displayName: 'GPS Latitude',
        description: 'GPS latitude coordinate',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'scatter',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Lng',
        internalName: 'gps_lng',
        displayName: 'GPS Longitude',
        description: 'GPS longitude coordinate',
        unit: 'degrees',
        dataType: 'float',
        chartType: 'scatter',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Alt',
        internalName: 'gps_alt',
        displayName: 'GPS Altitude',
        description: 'GPS altitude above sea level',
        unit: 'meters',
        dataType: 'float',
        chartType: 'area',
        category: 'position',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Spd',
        internalName: 'gps_speed',
        displayName: 'GPS Ground Speed',
        description: 'Ground speed from GPS',
        unit: 'm/s',
        dataType: 'float',
        chartType: 'line',
        category: 'position',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'HDop',
        internalName: 'gps_hdop',
        displayName: 'GPS HDOP',
        description: 'Horizontal dilution of precision - GPS accuracy indicator',
        unit: 'dimensionless',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'VDop',
        internalName: 'gps_vdop',
        displayName: 'GPS VDOP',
        description: 'Vertical dilution of precision - GPS accuracy indicator',
        unit: 'dimensionless',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'NSats',
        internalName: 'gps_satellites',
        displayName: 'GPS Satellites',
        description: 'Number of GPS satellites in use',
        unit: 'count',
        dataType: 'int',
        chartType: 'line',
        category: 'sensors',
        priority: 2,
        isCore: false
      }
    ]
  },
  {
    messageType: 'IMU',
    messageName: 'Inertial Measurement Unit',
    description: 'Accelerometer and gyroscope data from IMU sensors',
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'sensors',
    frequency: 'high',
    fields: [
      {
        rawName: 'AccX',
        internalName: 'imu_accel_x',
        displayName: 'Acceleration X',
        description: 'Linear acceleration along X-axis',
        unit: 'm/s²',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'AccY',
        internalName: 'imu_accel_y',
        displayName: 'Acceleration Y',
        description: 'Linear acceleration along Y-axis',
        unit: 'm/s²',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'AccZ',
        internalName: 'imu_accel_z',
        displayName: 'Acceleration Z',
        description: 'Linear acceleration along Z-axis',
        unit: 'm/s²',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'GyrX',
        internalName: 'imu_gyro_x',
        displayName: 'Gyro X',
        description: 'Angular velocity around X-axis',
        unit: 'rad/s',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'GyrY',
        internalName: 'imu_gyro_y',
        displayName: 'Gyro Y',
        description: 'Angular velocity around Y-axis',
        unit: 'rad/s',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 3,
        isCore: false
      },
      {
        rawName: 'GyrZ',
        internalName: 'imu_gyro_z',
        displayName: 'Gyro Z',
        description: 'Angular velocity around Z-axis',
        unit: 'rad/s',
        dataType: 'float',
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
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'sensors',
    frequency: 'medium',
    fields: [
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
    messageType: 'CURR',
    messageName: 'Current Sensor',
    description: 'Battery current and voltage measurements',
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'power',
    frequency: 'medium',
    fields: [
      {
        rawName: 'Volt',
        internalName: 'battery_voltage',
        displayName: 'Battery Voltage',
        description: 'Main battery voltage',
        unit: 'V',
        dataType: 'float',
        chartType: 'line',
        category: 'power',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'Curr',
        internalName: 'battery_current',
        displayName: 'Battery Current',
        description: 'Current draw from main battery',
        unit: 'A',
        dataType: 'float',
        chartType: 'line',
        category: 'power',
        priority: 1,
        isCore: true
      },
      {
        rawName: 'CurrTot',
        internalName: 'battery_consumed',
        displayName: 'Battery Consumed',
        description: 'Total battery energy consumed',
        unit: 'mAh',
        dataType: 'float',
        chartType: 'line',
        category: 'power',
        priority: 2,
        isCore: false
      }
    ]
  },
  {
    messageType: 'RCOU',
    messageName: 'RC Output',
    description: 'Radio control output to servos and motors',
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'control',
    frequency: 'high',
    fields: [
      {
        rawName: 'C1',
        internalName: 'servo_output_1',
        displayName: 'Servo Output 1',
        description: 'PWM output to servo/motor channel 1',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'C2',
        internalName: 'servo_output_2',
        displayName: 'Servo Output 2',
        description: 'PWM output to servo/motor channel 2',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'C3',
        internalName: 'servo_output_3',
        displayName: 'Servo Output 3',
        description: 'PWM output to servo/motor channel 3',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'C4',
        internalName: 'servo_output_4',
        displayName: 'Servo Output 4',
        description: 'PWM output to servo/motor channel 4',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      }
    ]
  },
  {
    messageType: 'RCIN',
    messageName: 'RC Input',
    description: 'Radio control input from transmitter',
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'control',
    frequency: 'high',
    fields: [
      {
        rawName: 'C1',
        internalName: 'rc_input_1',
        displayName: 'RC Input 1',
        description: 'RC channel 1 input (typically roll)',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'C2',
        internalName: 'rc_input_2',
        displayName: 'RC Input 2',
        description: 'RC channel 2 input (typically pitch)',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'C3',
        internalName: 'rc_input_3',
        displayName: 'RC Input 3',
        description: 'RC channel 3 input (typically throttle)',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'C4',
        internalName: 'rc_input_4',
        displayName: 'RC Input 4',
        description: 'RC channel 4 input (typically yaw)',
        unit: 'PWM',
        dataType: 'int',
        chartType: 'line',
        category: 'control',
        priority: 2,
        isCore: false
      }
    ]
  },
  {
    messageType: 'VIBE',
    messageName: 'Vibration',
    description: 'Vehicle vibration measurements for mechanical health monitoring',
    vehicleTypes: ['copter', 'plane', 'rover'],
    category: 'sensors',
    frequency: 'low',
    fields: [
      {
        rawName: 'VibeX',
        internalName: 'vibe_x',
        displayName: 'Vibration X',
        description: 'Vibration level along X-axis',
        unit: 'G',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'VibeY',
        internalName: 'vibe_y',
        displayName: 'Vibration Y',
        description: 'Vibration level along Y-axis',
        unit: 'G',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'VibeZ',
        internalName: 'vibe_z',
        displayName: 'Vibration Z',
        description: 'Vibration level along Z-axis',
        unit: 'G',
        dataType: 'float',
        chartType: 'line',
        category: 'sensors',
        priority: 2,
        isCore: false
      },
      {
        rawName: 'Clip0',
        internalName: 'vibe_clip_0',
        displayName: 'Vibration Clipping 0',
        description: 'Accelerometer clipping events on IMU 0',
        unit: 'count',
        dataType: 'int',
        chartType: 'bar',
        category: 'sensors',
        priority: 3,
        isCore: false
      }
    ]
  }
];

/**
 * Helper functions for parameter mapping
 */

// Create mapping from raw log parameter names to internal names
export function createRawToInternalMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  ARDUPILOT_LOG_MESSAGES.forEach(message => {
    message.fields.forEach(field => {
      // Support multiple ArduPilot field naming formats
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

// Create mapping from internal names to display names  
export function createInternalToDisplayMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  ARDUPILOT_LOG_MESSAGES.forEach(message => {
    message.fields.forEach(field => {
      mapping[field.internalName] = field.displayName;
    });
  });
  
  return mapping;
}

// Get field definition by internal name
export function getFieldDefinition(internalName: string): LogMessageField | null {
  for (const message of ARDUPILOT_LOG_MESSAGES) {
    const field = message.fields.find(f => f.internalName === internalName);
    if (field) return field;
  }
  return null;
}

// Get all core parameters for preset graphs
export function getCoreParameters(): LogMessageField[] {
  const coreParams: LogMessageField[] = [];
  
  ARDUPILOT_LOG_MESSAGES.forEach(message => {
    message.fields.forEach(field => {
      if (field.isCore) {
        coreParams.push(field);
      }
    });
  });
  
  return coreParams.sort((a, b) => a.priority - b.priority);
}

// Get parameters by category
export function getParametersByCategory(category: string): LogMessageField[] {
  const params: LogMessageField[] = [];
  
  ARDUPILOT_LOG_MESSAGES.forEach(message => {
    message.fields.forEach(field => {
      if (field.category === category) {
        params.push(field);
      }
    });
  });
  
  return params.sort((a, b) => a.priority - b.priority);
}

// Export the mappings as constants for fast lookup
export const RAW_TO_INTERNAL_MAPPING = createRawToInternalMapping();
export const INTERNAL_TO_DISPLAY_MAPPING = createInternalToDisplayMapping();