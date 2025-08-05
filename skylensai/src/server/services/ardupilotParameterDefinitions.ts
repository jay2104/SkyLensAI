/**
 * ArduPilot Parameter Definitions
 * Based on official ArduPilot documentation and source code analysis
 * 
 * References:
 * - https://ardupilot.org/copter/docs/logmessages.html
 * - https://github.com/ArduPilot/pymavlink
 * - ArduPilot Discord community research
 */

export interface ParameterDefinition {
  parameter: string;
  displayName: string;
  description: string;
  unit: string;
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  category: string;
  subcategory?: string;
  color: string;
  priority: number; // 1-5, higher = more important
  isCore: boolean; // Essential flight parameters
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
}

export interface ParameterCategory {
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  priority: number;
}

// Core parameter categories based on ArduPilot architecture
export const PARAMETER_CATEGORIES: Record<string, ParameterCategory> = {
  attitude: {
    name: 'attitude',
    displayName: 'Attitude & Orientation',
    description: 'Roll, pitch, yaw angles and angular rates',
    color: '#3b82f6', // Blue
    icon: 'Activity',
    priority: 1
  },
  position: {
    name: 'position',
    displayName: 'Position & Navigation',
    description: 'GPS coordinates, altitude, and navigation data',
    color: '#10b981', // Green
    icon: 'Navigation',
    priority: 2
  },
  power: {
    name: 'power',
    displayName: 'Power Systems',
    description: 'Battery voltage, current, and power consumption',
    color: '#f59e0b', // Yellow
    icon: 'Battery',
    priority: 3
  },
  control: {
    name: 'control',
    displayName: 'Flight Control',
    description: 'Control inputs, outputs, and PID tuning',
    color: '#8b5cf6', // Purple
    icon: 'Settings',
    priority: 4
  },
  sensors: {
    name: 'sensors',
    displayName: 'Sensor Data',
    description: 'IMU, magnetometer, barometer, and other sensors',
    color: '#06b6d4', // Cyan
    icon: 'Radar',
    priority: 5
  },
  performance: {
    name: 'performance',
    displayName: 'System Performance',
    description: 'CPU load, memory usage, and system health',
    color: '#84cc16', // Lime
    icon: 'BarChart3',
    priority: 6
  },
  propulsion: {
    name: 'propulsion',
    displayName: 'Motors & Propulsion',
    description: 'Motor outputs, ESC data, and propulsion systems',
    color: '#f97316', // Orange
    icon: 'Settings',
    priority: 7
  },
  environment: {
    name: 'environment',
    displayName: 'Environmental',
    description: 'Airspeed, temperature, and environmental conditions',
    color: '#64748b', // Slate
    icon: 'Thermometer',
    priority: 8
  }
};

// Comprehensive ArduPilot parameter definitions
export const ARDUPILOT_PARAMETERS: Record<string, ParameterDefinition> = {
  // ATT Message - Attitude (Roll, Pitch, Yaw)
  'roll': {
    parameter: 'roll',
    displayName: 'Roll Angle',
    description: 'Current roll angle of the vehicle',
    unit: 'degrees',
    chartType: 'line',
    category: 'attitude',
    color: '#3b82f6',
    priority: 5,
    isCore: true,
    minValue: -180,
    maxValue: 180,
    decimalPlaces: 2
  },
  'pitch': {
    parameter: 'pitch',
    displayName: 'Pitch Angle',
    description: 'Current pitch angle of the vehicle',
    unit: 'degrees',
    chartType: 'line',
    category: 'attitude',
    color: '#1d4ed8',
    priority: 5,
    isCore: true,
    minValue: -90,
    maxValue: 90,
    decimalPlaces: 2
  },
  'yaw': {
    parameter: 'yaw',
    displayName: 'Yaw Angle',
    description: 'Current yaw angle (heading) of the vehicle',
    unit: 'degrees',
    chartType: 'line',
    category: 'attitude',
    color: '#1e40af',
    priority: 5,
    isCore: true,
    minValue: 0,
    maxValue: 360,
    decimalPlaces: 2
  },
  'rollspeed': {
    parameter: 'rollspeed',
    displayName: 'Roll Rate',
    description: 'Angular velocity around roll axis',
    unit: 'deg/s',
    chartType: 'line',
    category: 'attitude',
    color: '#60a5fa',
    priority: 3,
    isCore: false,
    decimalPlaces: 2
  },
  'pitchspeed': {
    parameter: 'pitchspeed',
    displayName: 'Pitch Rate',
    description: 'Angular velocity around pitch axis',
    unit: 'deg/s',
    chartType: 'line',
    category: 'attitude',
    color: '#93c5fd',
    priority: 3,
    isCore: false,
    decimalPlaces: 2
  },
  'yawspeed': {
    parameter: 'yawspeed',
    displayName: 'Yaw Rate',
    description: 'Angular velocity around yaw axis',
    unit: 'deg/s',
    chartType: 'line',
    category: 'attitude',
    color: '#dbeafe',
    priority: 3,
    isCore: false,
    decimalPlaces: 2
  },

  // GPS Message - Position
  'gps_lat': {
    parameter: 'gps_lat',
    displayName: 'GPS Latitude',
    description: 'GPS latitude coordinate',
    unit: 'degrees',
    chartType: 'scatter',
    category: 'position',
    color: '#10b981',
    priority: 5,
    isCore: true,
    decimalPlaces: 7
  },
  'gps_lng': {
    parameter: 'gps_lng',
    displayName: 'GPS Longitude',
    description: 'GPS longitude coordinate',
    unit: 'degrees',
    chartType: 'scatter',
    category: 'position',
    color: '#059669',
    priority: 5,
    isCore: true,
    decimalPlaces: 7
  },
  'gps_alt': {
    parameter: 'gps_alt',
    displayName: 'GPS Altitude',
    description: 'GPS altitude above sea level',
    unit: 'meters',
    chartType: 'area',
    category: 'position',
    color: '#047857',
    priority: 4,
    isCore: true,
    decimalPlaces: 2
  },
  'gps_spd': {
    parameter: 'gps_spd',
    displayName: 'GPS Speed',
    description: 'GPS ground speed',
    unit: 'm/s',
    chartType: 'line',
    category: 'position',
    color: '#065f46',
    priority: 4,
    isCore: false,
    decimalPlaces: 2
  },
  'gps_hdop': {
    parameter: 'gps_hdop',
    displayName: 'GPS HDOP',
    description: 'Horizontal dilution of precision - GPS accuracy indicator',
    unit: 'dimensionless',
    chartType: 'line',
    category: 'position',
    color: '#34d399',
    priority: 3,
    isCore: false,
    decimalPlaces: 2
  },
  'gps_vdop': {
    parameter: 'gps_vdop',
    displayName: 'GPS VDOP',
    description: 'Vertical dilution of precision - GPS accuracy indicator',
    unit: 'dimensionless',
    chartType: 'line',
    category: 'position',
    color: '#6ee7b7',
    priority: 2,
    isCore: false,
    decimalPlaces: 2
  },

  // Altitude measurements
  'altitude': {
    parameter: 'altitude',
    displayName: 'Barometric Altitude',
    description: 'Altitude from barometric pressure sensor',
    unit: 'meters',
    chartType: 'area',
    category: 'position',
    color: '#10b981',
    priority: 5,
    isCore: true,
    decimalPlaces: 2
  },
  'baro_crt': {
    parameter: 'baro_crt',
    displayName: 'Climb Rate',
    description: 'Vertical velocity from barometer',
    unit: 'm/s',
    chartType: 'line',
    category: 'position',
    color: '#059669',
    priority: 4,
    isCore: false,
    decimalPlaces: 2
  },
  'baro_press': {
    parameter: 'baro_press',
    displayName: 'Barometric Pressure',
    description: 'Atmospheric pressure measurement',
    unit: 'Pa',
    chartType: 'line',
    category: 'sensors',
    color: '#06b6d4',
    priority: 2,
    isCore: false,
    decimalPlaces: 1
  },

  // Battery/Power System
  'battery_voltage': {
    parameter: 'battery_voltage',
    displayName: 'Battery Voltage',
    description: 'Main battery voltage',
    unit: 'volts',
    chartType: 'line',
    category: 'power',
    color: '#f59e0b',
    priority: 5,
    isCore: true,
    minValue: 0,
    decimalPlaces: 2
  },
  'battery_current': {
    parameter: 'battery_current',
    displayName: 'Battery Current',
    description: 'Current draw from main battery',
    unit: 'amperes',
    chartType: 'line',
    category: 'power',
    color: '#d97706',
    priority: 4,
    isCore: true,
    minValue: 0,
    decimalPlaces: 2
  },
  'battery_current_total': {
    parameter: 'battery_current_total',
    displayName: 'Battery Consumption',
    description: 'Total battery energy consumed',
    unit: 'mAh',
    chartType: 'line',
    category: 'power',
    color: '#92400e',
    priority: 3,
    isCore: false,
    minValue: 0,
    decimalPlaces: 0
  },
  'battery_remaining': {
    parameter: 'battery_remaining',
    displayName: 'Battery Remaining',
    description: 'Estimated remaining battery percentage',
    unit: 'percent',
    chartType: 'line',
    category: 'power',
    color: '#78350f',
    priority: 4,
    isCore: true,
    minValue: 0,
    maxValue: 100,
    decimalPlaces: 1
  },

  // IMU Sensors
  'accel_x': {
    parameter: 'accel_x',
    displayName: 'Acceleration X',
    description: 'Linear acceleration along X-axis',
    unit: 'm/s²',
    chartType: 'line',
    category: 'sensors',
    color: '#06b6d4',
    priority: 2,
    isCore: false,
    decimalPlaces: 3
  },
  'accel_y': {
    parameter: 'accel_y',
    displayName: 'Acceleration Y',
    description: 'Linear acceleration along Y-axis',
    unit: 'm/s²',
    chartType: 'line',
    category: 'sensors',
    color: '#0891b2',
    priority: 2,
    isCore: false,
    decimalPlaces: 3
  },
  'accel_z': {
    parameter: 'accel_z',
    displayName: 'Acceleration Z',
    description: 'Linear acceleration along Z-axis',
    unit: 'm/s²',
    chartType: 'line',
    category: 'sensors',
    color: '#0e7490',
    priority: 2,
    isCore: false,
    decimalPlaces: 3
  },
  'gyro_x': {
    parameter: 'gyro_x',
    displayName: 'Gyro X',
    description: 'Angular velocity around X-axis',
    unit: 'rad/s',
    chartType: 'line',
    category: 'sensors',
    color: '#155e75',
    priority: 2,
    isCore: false,
    decimalPlaces: 4
  },
  'gyro_y': {
    parameter: 'gyro_y',
    displayName: 'Gyro Y',
    description: 'Angular velocity around Y-axis',
    unit: 'rad/s',
    chartType: 'line',
    category: 'sensors',
    color: '#164e63',
    priority: 2,
    isCore: false,
    decimalPlaces: 4
  },
  'gyro_z': {
    parameter: 'gyro_z',
    displayName: 'Gyro Z',
    description: 'Angular velocity around Z-axis',
    unit: 'rad/s',
    chartType: 'line',
    category: 'sensors',
    color: '#083344',
    priority: 2,
    isCore: false,
    decimalPlaces: 4
  },

  // Motor/Servo Outputs (RCOUT)
  'motor_1': {
    parameter: 'motor_1',
    displayName: 'Motor 1 Output',
    description: 'PWM output to motor 1',
    unit: 'PWM',
    chartType: 'line',
    category: 'propulsion',
    color: '#f97316',
    priority: 3,
    isCore: false,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },
  'motor_2': {
    parameter: 'motor_2',
    displayName: 'Motor 2 Output',
    description: 'PWM output to motor 2',
    unit: 'PWM',
    chartType: 'line',
    category: 'propulsion',
    color: '#ea580c',
    priority: 3,
    isCore: false,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },
  'motor_3': {
    parameter: 'motor_3',
    displayName: 'Motor 3 Output',
    description: 'PWM output to motor 3',
    unit: 'PWM',
    chartType: 'line',
    category: 'propulsion',
    color: '#dc2626',
    priority: 3,
    isCore: false,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },
  'motor_4': {
    parameter: 'motor_4',
    displayName: 'Motor 4 Output',
    description: 'PWM output to motor 4',
    unit: 'PWM',
    chartType: 'line',
    category: 'propulsion',
    color: '#b91c1c',
    priority: 3,
    isCore: false,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },

  // RC Input (RCIN)
  'rc_roll': {
    parameter: 'rc_roll',
    displayName: 'RC Roll Input',
    description: 'Radio control roll stick input',
    unit: 'PWM',
    chartType: 'line',
    category: 'control',
    color: '#8b5cf6',
    priority: 3,
    isCore: false,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },
  'rc_pitch': {
    parameter: 'rc_pitch',
    displayName: 'RC Pitch Input',
    description: 'Radio control pitch stick input',
    unit: 'PWM',
    chartType: 'line',
    category: 'control',
    color: '#7c3aed',
    priority: 3,
    isCore: false,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },
  'rc_throttle': {
    parameter: 'rc_throttle',
    displayName: 'RC Throttle Input',
    description: 'Radio control throttle stick input',
    unit: 'PWM',
    chartType: 'line',
    category: 'control',
    color: '#6d28d9',
    priority: 4,
    isCore: true,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },
  'rc_yaw': {
    parameter: 'rc_yaw',
    displayName: 'RC Yaw Input',
    description: 'Radio control yaw stick input',
    unit: 'PWM',
    chartType: 'line',
    category: 'control',
    color: '#5b21b6',
    priority: 3,
    isCore: false,
    minValue: 1000,
    maxValue: 2000,
    decimalPlaces: 0
  },

  // Airspeed (for fixed-wing)
  'arsp_airspeed': {
    parameter: 'arsp_airspeed',
    displayName: 'Airspeed',
    description: 'True airspeed measurement',
    unit: 'm/s',
    chartType: 'line',
    category: 'environment',
    color: '#64748b',
    priority: 4,
    isCore: false,  // More relevant for fixed-wing
    minValue: 0,
    decimalPlaces: 2
  },
  'arsp_diffpress': {
    parameter: 'arsp_diffpress',
    displayName: 'Differential Pressure',
    description: 'Airspeed sensor differential pressure',
    unit: 'Pa',
    chartType: 'line',
    category: 'environment',
    color: '#475569',
    priority: 2,
    isCore: false,
    decimalPlaces: 2
  },

  // Vibration
  'vibration_x': {
    parameter: 'vibration_x',
    displayName: 'Vibration X',
    description: 'Vibration level along X-axis',
    unit: 'G',
    chartType: 'line',
    category: 'sensors',
    color: '#dc2626',
    priority: 3,
    isCore: false,
    decimalPlaces: 3
  },
  'vibration_y': {
    parameter: 'vibration_y',
    displayName: 'Vibration Y',
    description: 'Vibration level along Y-axis',
    unit: 'G',
    chartType: 'line',
    category: 'sensors',
    color: '#b91c1c',
    priority: 3,
    isCore: false,
    decimalPlaces: 3
  },
  'vibration_z': {
    parameter: 'vibration_z',
    displayName: 'Vibration Z',
    description: 'Vibration level along Z-axis',
    unit: 'G',
    chartType: 'line',
    category: 'sensors',
    color: '#991b1b',
    priority: 3,
    isCore: false,
    decimalPlaces: 3
  },

  // Performance monitoring
  'cpu_load': {
    parameter: 'cpu_load',
    displayName: 'CPU Load',
    description: 'Flight controller CPU utilization',
    unit: 'percent',
    chartType: 'line',
    category: 'performance',
    color: '#84cc16',
    priority: 2,
    isCore: false,
    minValue: 0,
    maxValue: 100,
    decimalPlaces: 1
  },
  'memory_usage': {
    parameter: 'memory_usage',
    displayName: 'Memory Usage',
    description: 'Flight controller memory utilization',
    unit: 'bytes',
    chartType: 'line',
    category: 'performance',
    color: '#65a30d',
    priority: 2,
    isCore: false,
    minValue: 0,
    decimalPlaces: 0
  },

  // Magnetometer
  'magnetometer_x': {
    parameter: 'magnetometer_x',
    displayName: 'Magnetometer X',
    description: 'Magnetic field strength along X-axis',
    unit: 'Gauss',
    chartType: 'line',
    category: 'sensors',
    color: '#06b6d4',
    priority: 2,
    isCore: false,
    decimalPlaces: 2
  },
  'magnetometer_y': {
    parameter: 'magnetometer_y',
    displayName: 'Magnetometer Y',
    description: 'Magnetic field strength along Y-axis',
    unit: 'Gauss',
    chartType: 'line',
    category: 'sensors',
    color: '#0891b2',
    priority: 2,
    isCore: false,
    decimalPlaces: 2
  },
  'magnetometer_z': {
    parameter: 'magnetometer_z',
    displayName: 'Magnetometer Z',
    description: 'Magnetic field strength along Z-axis',
    unit: 'Gauss',
    chartType: 'line',
    category: 'sensors',
    color: '#0e7490',
    priority: 2,
    isCore: false,
    decimalPlaces: 2
  }
};

/**
 * Get parameter definition by name
 */
export function getParameterDefinition(parameterName: string): ParameterDefinition | null {
  return ARDUPILOT_PARAMETERS[parameterName] || null;
}

/**
 * Get all parameters for a specific category
 */
export function getParametersByCategory(categoryName: string): ParameterDefinition[] {
  return Object.values(ARDUPILOT_PARAMETERS).filter(param => param.category === categoryName);
}

/**
 * Get core flight parameters
 */
export function getCoreParameters(): ParameterDefinition[] {
  return Object.values(ARDUPILOT_PARAMETERS).filter(param => param.isCore);
}

/**
 * Create fallback parameter definition for unknown parameters
 */
export function createFallbackParameter(parameterName: string): ParameterDefinition {
  return {
    parameter: parameterName,
    displayName: parameterName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `${parameterName} telemetry parameter`,
    unit: 'unknown',
    chartType: 'line',
    category: 'sensors',
    color: '#64748b',
    priority: 1,
    isCore: false,
    decimalPlaces: 2
  };
}