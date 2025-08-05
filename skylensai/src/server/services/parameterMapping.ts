/**
 * Parameter Mapping System
 * Maps actual ArduPilot parameter names to standardized dashboard names
 */

export interface ParameterMapping {
  [actualName: string]: string; // actualName -> standardizedName
}

/**
 * ArduPilot to Standard Parameter Mapping
 * Maps the actual parameter names extracted from logs to the standardized names expected by the dashboard
 */
export const ARDUPILOT_PARAMETER_MAPPING: ParameterMapping = {
  // Battery Parameters
  'battery_volt': 'battery_voltage',
  'battery_voltr': 'battery_voltage', 
  'battery_curr': 'battery_current',
  'battery_current': 'battery_current',
  'battery_currtot': 'battery_current_total',
  'battery_remaining': 'battery_remaining',
  
  // Altitude Parameters  
  'baro_alt': 'altitude', // Frontend expects 'altitude' 
  'baro_crt': 'climb_rate',
  'baro_press': 'barometric_pressure',
  
  // GPS Parameters
  'gps_lat': 'gps_lat',
  'gps_lng': 'gps_lng', 
  'gps_lon': 'gps_lng', // Alternative longitude name
  'gps_alt': 'gps_altitude',
  'gps_spd': 'gps_speed',
  'gps_hdg': 'gps_heading',
  'gps_hdop': 'gps_hdop',
  'gps_vdop': 'gps_vdop',
  'gps_sacc': 'gps_speed_accuracy',
  'gps_vacc': 'gps_vertical_accuracy',
  
  // Attitude Parameters (ArduPilot ATT message)
  'att_roll': 'roll',  // Frontend expects 'roll'
  'att_pitch': 'pitch', // Frontend expects 'pitch' 
  'att_yaw': 'yaw',     // Frontend expects 'yaw'
  'roll': 'roll',       // If roll exists directly
  'pitch': 'pitch',     // If pitch exists directly 
  'yaw': 'yaw',         // If yaw exists directly
  'rollspeed': 'roll_rate',
  'pitchspeed': 'pitch_rate',
  'yawspeed': 'yaw_rate',
  
  // IMU Parameters
  'imu_accx': 'accel_x',
  'imu_accy': 'accel_y', 
  'imu_accz': 'accel_z',
  'imu_gyrx': 'gyro_x',
  'imu_gyry': 'gyro_y',
  'imu_gyrz': 'gyro_z',
  
  // Motor/Servo Parameters
  'motor_1': 'motor_1',
  'motor_2': 'motor_2',
  'motor_3': 'motor_3', 
  'motor_4': 'motor_4',
  'servo_1': 'servo_1',
  'servo_2': 'servo_2',
  'servo_3': 'servo_3',
  'servo_4': 'servo_4',
  
  // Rate Controller Parameters
  'rate_r': 'rate_roll',
  'rate_p': 'rate_pitch',
  'rate_y': 'rate_yaw',
  'rate_rdes': 'rate_roll_desired',
  'rate_pdes': 'rate_pitch_desired', 
  'rate_ydes': 'rate_yaw_desired',
  'rate_rout': 'rate_roll_output',
  'rate_pout': 'rate_pitch_output',
  'rate_yout': 'rate_yaw_output',
  
  // RC Input/Output
  'rc_input_roll': 'rc_roll_input',
  'rc_input_pitch': 'rc_pitch_input',
  'rc_input_throttle': 'rc_throttle_input', 
  'rc_input_yaw': 'rc_yaw_input',
  'rc_input_mode': 'rc_mode_input',
  'rc_roll': 'rc_roll',
  'rc_pitch': 'rc_pitch',
  'rc_throttle': 'rc_throttle',
  'rc_yaw': 'rc_yaw',
  
  // Vibration Parameters
  'vibe_vibex': 'vibration_x',
  'vibe_vibey': 'vibration_y',
  'vibe_vibez': 'vibration_z',
  
  // Performance Monitoring
  'pm_load': 'cpu_load',
  'pm_mem': 'memory_usage',
  'pm_maxt': 'max_task_time',
  'pm_nlon': 'loop_count',
  
  // Airspeed (for fixed-wing)
  'arsp_airspeed': 'airspeed',
  'arsp_diffpress': 'differential_pressure',
  'arsp_rawpress': 'raw_pressure',
  
  // Control Tuning
  'ctun_tho': 'throttle_output',
  
  // Power Systems
  'power_total': 'power_total',
  
  // GPS Accuracy
  'gpa_vv': 'gps_vertical_velocity',
  'gpa_delta': 'gps_delta_time',
  'gpa_sms': 'gps_time_delta',
  
  // Magnetometer
  'mag_magx': 'magnetometer_x',
  'mag_magy': 'magnetometer_y', 
  'mag_magz': 'magnetometer_z',
  'mag_ofsx': 'mag_offset_x',
  'mag_ofsy': 'mag_offset_y',
  'mag_ofsz': 'mag_offset_z',
  
  // PID Controllers
  'pid_position_p': 'pid_pos_p',
  'pid_position_i': 'pid_pos_i',
  'pid_position_d': 'pid_pos_d',
  'pid_position_tar': 'pid_pos_target',
  'pid_position_act': 'pid_pos_actual',
  'pid_position_err': 'pid_pos_error',
  'pid_rate_p': 'pid_rate_p',
  'pid_rate_i': 'pid_rate_i', 
  'pid_rate_d': 'pid_rate_d',
  'pid_rate_tar': 'pid_rate_target',
  'pid_rate_act': 'pid_rate_actual',
  'pid_rate_err': 'pid_rate_error',
  
  // Auxiliary outputs
  'aux_output_1': 'aux_1',
  'aux_output_2': 'aux_2',
  'aux_output_3': 'aux_3',
  'aux_output_4': 'aux_4',
  'aux_output_5': 'aux_5',
  'aux_output_6': 'aux_6',
};

/**
 * Maps an actual parameter name to its standardized equivalent
 */
export function mapParameterName(actualName: string): string {
  return ARDUPILOT_PARAMETER_MAPPING[actualName] || actualName;
}

/**
 * Maps an array of parameter names to their standardized equivalents
 */
export function mapParameterNames(actualNames: string[]): string[] {
  return actualNames.map(name => mapParameterName(name));
}

/**
 * Creates a reverse mapping from standardized names back to actual names
 * Useful for debugging and parameter discovery
 */
export function createReverseMapping(): Record<string, string[]> {
  const reverseMap: Record<string, string[]> = {};
  
  for (const [actualName, standardName] of Object.entries(ARDUPILOT_PARAMETER_MAPPING)) {
    if (!reverseMap[standardName]) {
      reverseMap[standardName] = [];
    }
    reverseMap[standardName].push(actualName);
  }
  
  return reverseMap;
}

/**
 * Gets all standardized parameter names that are mapped
 */
export function getStandardizedParameterNames(): string[] {
  return Array.from(new Set(Object.values(ARDUPILOT_PARAMETER_MAPPING)));
}