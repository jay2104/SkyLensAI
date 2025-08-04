# Comprehensive Log Parser Specifications

## Overview

This document defines the complete log parser specifications for Phase 1, targeting **ALL major message types and 200+ parameters** extraction versus the current ~20 parameters. Based on competitive analysis of Mission Planner, Flight Review, and other professional tools, this specification ensures SkyLensAI exceeds all reference tools in parsing comprehensiveness.

## Current vs Target Parsing Capability

### Current State (From CLAUDE.md Analysis)
- **Parameters Extracted**: ~20 (GPS, ATT, BAT basics)
- **Message Types**: 3 (GPS, ATT, BAT)
- **Format Support**: Limited ArduPilot, TODO PX4
- **Analysis Depth**: 5% of PRD requirements

### Phase 1 Target
- **Parameters Extracted**: 200+ (ALL available in logs)
- **Message Types**: 60+ ArduPilot, 40+ PX4, 400+ DJI parameters
- **Format Support**: Universal (ArduPilot, PX4, DJI, others)
- **Analysis Depth**: 100% of available log data

## Format Specifications

### 1. ArduPilot Format Support (.bin, .tlog, .log)

#### 1.1 Complete Message Type Support (60+ types)

Based on Mission Planner documentation and competitive analysis:

```typescript
// Complete ArduPilot message type enumeration
enum ArduPilotMessageType {
  // Core Flight Control (currently supported)
  GPS = 'GPS',
  GPS2 = 'GPS2', 
  ATT = 'ATT',        // Attitude
  BAT = 'BAT',        // Battery
  BAT2 = 'BAT2',      // Secondary battery
  
  // Flight Control Extended (missing in current implementation)
  CTUN = 'CTUN',      // Control Tuning
  NTUN = 'NTUN',      // Navigation Tuning  
  STRT = 'STRT',      // Startup messages
  MSG = 'MSG',        // Text messages
  MODE = 'MODE',      // Flight mode changes
  
  // Sensor Data (missing)
  IMU = 'IMU',        // Inertial Measurement Unit
  IMU2 = 'IMU2',      // Secondary IMU
  IMU3 = 'IMU3',      // Tertiary IMU
  BARO = 'BARO',      // Barometer
  MAG = 'MAG',        // Magnetometer
  MAG2 = 'MAG2',      // Secondary magnetometer
  MAG3 = 'MAG3',      // Tertiary magnetometer
  
  // Radio Control (missing)
  RCIN = 'RCIN',      // RC Input
  RCOU = 'RCOU',      // RC Output
  SERVO = 'SERVO',    // Servo outputs
  
  // Power Systems (missing)
  CURR = 'CURR',      // Current sensor
  POWR = 'POWR',      // Power status
  VOLT = 'VOLT',      // Voltage monitoring
  
  // Navigation & Position (missing)
  POS = 'POS',        // Position estimate
  ORGN = 'ORGN',      // Origin setting
  HOME = 'HOME',      // Home position
  
  // Performance Monitoring (missing)
  PM = 'PM',          // Performance monitoring
  LOAD = 'LOAD',      // CPU load
  
  // Error Handling (missing)
  ERR = 'ERR',        // Error messages
  EV = 'EV',          // Event messages
  
  // Vibration Analysis (missing)
  VIBE = 'VIBE',      // Vibration levels
  
  // Additional Systems (missing)
  CAM = 'CAM',        // Camera trigger
  GIMBAL = 'GIMBAL',  // Gimbal control
  MOUNT = 'MOUNT',    // Camera mount
  
  // Extended Sensor Suite (missing)
  ADSB = 'ADSB',      // ADS-B transponder
  ESC = 'ESC',        // Electronic Speed Controller
  RPM = 'RPM',        // RPM sensor
  TEMP = 'TEMP',      // Temperature
  
  // Auto Tune (missing)
  ATUN = 'ATUN',      // Auto tune data
  ATDE = 'ATDE',      // Auto tune details
  
  // Extended Flight Data (missing)
  RATE = 'RATE',      // Rate controller
  PIDP = 'PIDP',      // PID Position
  PIDR = 'PIDR',      // PID Rate
  PIDY = 'PIDY',      // PID Yaw
  
  // Vehicle-Specific Messages
  // Copter-specific
  MOTB = 'MOTB',      // Motor battery
  DSTL = 'DSTL',      // Distance sensor
  
  // Plane-specific
  ARSP = 'ARSP',      // Airspeed
  PTUN = 'PTUN',      // Pitch tuning
  QTUN = 'QTUN',      // Quad plane tuning
  
  // Rover-specific
  WHEL = 'WHEL',      // Wheel encoder
  STEER = 'STEER',    // Steering
  
  // Additional Extended Messages (total 60+)
  GPA = 'GPA',        // GPS accuracy
  BCN = 'BCN',        // Beacon
  PROX = 'PROX',      // Proximity sensor
  RFND = 'RFND',      // Range finder
  OF = 'OF',          // Optical flow
  FLOW = 'FLOW',      // Flow sensor
  TERR = 'TERR',      // Terrain data
  UBX1 = 'UBX1',      // UBlox GPS data 1
  UBX2 = 'UBX2',      // UBlox GPS data 2
  UNIT = 'UNIT',      // Unit definitions
  MULT = 'MULT',      // Multipliers
  FMTU = 'FMTU',      // Format units
  
  // Format definition
  FMT = 'FMT'         // Format message (structure definition)
}
```

#### 1.2 Parameter Extraction Specifications

```typescript
// Complete parameter extraction for each message type
interface ArduPilotParameters {
  // Attitude (ATT) - Enhanced from current basic implementation
  ATT: {
    TimeUS: number;      // Timestamp microseconds
    DesRoll: number;     // Desired roll (pilot input)
    Roll: number;        // Actual roll
    DesPitch: number;    // Desired pitch (pilot input) 
    Pitch: number;       // Actual pitch
    DesYaw: number;      // Desired yaw (pilot input)
    Yaw: number;         // Actual yaw
    ErrRP: number;       // Roll/Pitch error estimate
    ErrYaw: number;      // Yaw error estimate
  };
  
  // Control Tuning (CTUN) - Currently missing
  CTUN: {
    TimeUS: number;      // Timestamp
    ThI: number;         // Throttle input
    ABst: number;        // Angle boost
    ThO: number;         // Throttle output
    ThH: number;         // Hover throttle
    DAlt: number;        // Desired altitude
    Alt: number;         // Current altitude
    BAlt: number;        // Barometer altitude
    DSAlt: number;       // Desired distance from sonar/lidar
    SAlt: number;        // Sonar/lidar altitude
    TAlt: number;        // Terrain altitude
    DCRt: number;        // Desired climb rate
    CRt: number;         // Climb rate
    N: number;           // Harmonic notch frequency
  };
  
  // Navigation Tuning (NTUN) - Currently missing
  NTUN: {
    TimeUS: number;      // Timestamp
    WPDst: number;       // Distance to waypoint
    WPBrg: number;       // Bearing to waypoint
    PErX: number;        // Position error X
    PErY: number;        // Position error Y
    DVelX: number;       // Desired velocity X
    DVelY: number;       // Desired velocity Y
    VelX: number;        // Actual velocity X
    VelY: number;        // Actual velocity Y
    DAcX: number;        // Desired acceleration X
    DAcY: number;        // Desired acceleration Y
    DRol: number;        // Desired roll
    DPit: number;        // Desired pitch
  };
  
  // Performance Monitoring (PM) - Currently missing
  PM: {
    TimeUS: number;      // Timestamp
    NLon: number;        // Number of long loops
    NLoop: number;       // Total loops
    MaxT: number;        // Max loop time
    Mem: number;         // Available memory
    Load: number;        // CPU load percentage
  };
  
  // Error Messages (ERR) - Currently missing
  ERR: {
    TimeUS: number;      // Timestamp
    Subsys: number;      // Subsystem (29 different types from competitive analysis)
    ECode: number;       // Error code
  };
  
  // GPS Accuracy (GPA) - Currently missing
  GPA: {
    TimeUS: number;      // Timestamp
    VDop: number;        // Vertical dilution of precision
    HAcc: number;        // Horizontal accuracy
    VAcc: number;        // Vertical accuracy
    SAcc: number;        // Speed accuracy
    VV: number;          // Vertical velocity flag
    SMS: number;         // System time
    Delta: number;       // Time delta
  };
  
  // Vibration (VIBE) - Currently missing
  VIBE: {
    TimeUS: number;      // Timestamp
    VibeX: number;       // Vibration X axis
    VibeY: number;       // Vibration Y axis
    VibeZ: number;       // Vibration Z axis
    Clip0: number;       // Clipping count IMU 0
    Clip1: number;       // Clipping count IMU 1
    Clip2: number;       // Clipping count IMU 2
  };
  
  // IMU Data (IMU) - Currently missing
  IMU: {
    TimeUS: number;      // Timestamp
    GyrX: number;        // Gyro X (rad/s)
    GyrY: number;        // Gyro Y (rad/s)
    GyrZ: number;        // Gyro Z (rad/s)
    AccX: number;        // Accel X (m/s/s)
    AccY: number;        // Accel Y (m/s/s)
    AccZ: number;        // Accel Z (m/s/s)
  };
  
  // RC Input (RCIN) - Currently missing
  RCIN: {
    TimeUS: number;      // Timestamp
    C1: number;          // Channel 1 (Roll)
    C2: number;          // Channel 2 (Pitch)
    C3: number;          // Channel 3 (Throttle)
    C4: number;          // Channel 4 (Yaw)
    C5: number;          // Channel 5 (Flight mode)
    C6: number;          // Channel 6 (Tuning)
    C7: number;          // Channel 7 (Aux 1)
    C8: number;          // Channel 8 (Aux 2)
    C9: number;          // Channel 9 (Aux 3)
    C10: number;         // Channel 10 (Aux 4)
    C11: number;         // Channel 11 (Aux 5)
    C12: number;         // Channel 12 (Aux 6)
    C13: number;         // Channel 13 (Aux 7)
    C14: number;         // Channel 14 (Aux 8)
  };
  
  // RC Output (RCOU) - Currently missing
  RCOU: {
    TimeUS: number;      // Timestamp
    C1: number;          // Output 1 (Motor 1/Aileron)
    C2: number;          // Output 2 (Motor 2/Elevator)
    C3: number;          // Output 3 (Motor 3/Throttle)
    C4: number;          // Output 4 (Motor 4/Rudder)
    C5: number;          // Output 5 (Motor 5/Gear)
    C6: number;          // Output 6 (Motor 6/Flap)
    C7: number;          // Output 7 (Motor 7/Aux1)
    C8: number;          // Output 8 (Motor 8/Aux2)
    C9: number;          // Output 9 (Aux3)
    C10: number;         // Output 10 (Aux4)
    C11: number;         // Output 11 (Aux5)
    C12: number;         // Output 12 (Aux6)
    C13: number;         // Output 13 (Aux7)
    C14: number;         // Output 14 (Aux8)
  };
  
  // Auto Tune (ATUN) - Currently missing
  ATUN: {
    TimeUS: number;      // Timestamp
    Axis: number;        // Axis (0=Roll, 1=Pitch)
    TuneStep: number;    // Tuning step
    RateMin: number;     // Minimum rate
    RateMax: number;     // Maximum rate
    RPGain: number;      // Rate P gain
    RDGain: number;      // Rate D gain
    SPGain: number;      // Stabilize P gain
  };
  
  // Additional message types (30+ more)...
  // Total target: 200+ individual parameters across all message types
}
```

### 2. PX4 ULG Format Support

#### 2.1 ULog Message Types (40+ types)

Based on Flight Review analysis and PX4 documentation:

```typescript
// Complete PX4 ULog message enumeration
enum PX4MessageType {
  // Vehicle State
  VEHICLE_STATUS = 'vehicle_status',
  VEHICLE_ATTITUDE = 'vehicle_attitude',
  VEHICLE_ATTITUDE_SETPOINT = 'vehicle_attitude_setpoint',
  VEHICLE_LOCAL_POSITION = 'vehicle_local_position',
  VEHICLE_GLOBAL_POSITION = 'vehicle_global_position',
  VEHICLE_RATES_SETPOINT = 'vehicle_rates_setpoint',
  
  // Sensor Data
  SENSOR_COMBINED = 'sensor_combined',
  SENSOR_PREFLIGHT = 'sensor_preflight',
  SENSOR_ACCEL = 'sensor_accel',
  SENSOR_GYRO = 'sensor_gyro',
  SENSOR_MAG = 'sensor_mag',
  SENSOR_BARO = 'sensor_baro',
  
  // Control Systems
  ACTUATOR_CONTROLS_0 = 'actuator_controls_0',
  ACTUATOR_OUTPUTS = 'actuator_outputs',
  CONTROL_STATE = 'control_state',
  
  // Navigation & GPS
  VEHICLE_GPS_POSITION = 'vehicle_gps_position',
  GPS_INJECT_DATA = 'gps_inject_data',
  
  // Estimation
  ESTIMATOR_STATUS = 'estimator_status',
  EKF2_INNOVATIONS = 'ekf2_innovations',
  
  // System Monitoring
  CPULOAD = 'cpuload',
  TELEMETRY_STATUS = 'telemetry_status',
  COMMANDER_STATE = 'commander_state',
  
  // Power Systems
  BATTERY_STATUS = 'battery_status',
  
  // Extended Systems (additional 20+ types)
  AIRSPEED = 'airspeed',
  OPTICAL_FLOW = 'optical_flow',
  DISTANCE_SENSOR = 'distance_sensor',
  SAFETY = 'safety',
  HOME_POSITION = 'home_position',
  MISSION = 'mission',
  MISSION_RESULT = 'mission_result',
  OFFBOARD_CONTROL_MODE = 'offboard_control_mode',
  VEHICLE_COMMAND = 'vehicle_command',
  VEHICLE_COMMAND_ACK = 'vehicle_command_ack',
  MANUAL_CONTROL_SETPOINT = 'manual_control_setpoint',
  RC_CHANNELS = 'rc_channels',
  INPUT_RC = 'input_rc',
  ACTUATOR_ARMED = 'actuator_armed',
  GEOFENCE_RESULT = 'geofence_result',
  VEHICLE_LAND_DETECTED = 'vehicle_land_detected',
  VTOL_VEHICLE_STATUS = 'vtol_vehicle_status',
  WIND_ESTIMATE = 'wind_estimate',
  TEE_STATUS = 'tecs_status',
  SYSTEM_POWER = 'system_power',
  SERVORAIL_STATUS = 'servorail_status',
  ESC_STATUS = 'esc_status',
  ESC_REPORT = 'esc_report'
}
```

#### 2.2 PX4 Parameter Extraction

```typescript
// Complete PX4 parameter extraction
interface PX4Parameters {
  // Vehicle Attitude (comprehensive)
  vehicle_attitude: {
    timestamp: number;
    q: [number, number, number, number]; // Quaternion
    rollspeed: number;
    pitchspeed: number;
    yawspeed: number;
  };
  
  // Sensor Combined (all IMU data)
  sensor_combined: {
    timestamp: number;
    gyro_rad: [number, number, number];
    gyro_integral_dt: number;
    accelerometer_timestamp_relative: number;
    accelerometer_m_s2: [number, number, number];
    accelerometer_integral_dt: number;
    magnetometer_timestamp_relative: number;
    magnetometer_ga: [number, number, number];
    baro_timestamp_relative: number;
    baro_alt_meter: number;
    baro_temp_celcius: number;
  };
  
  // EKF2 Innovations (vibration analysis)
  ekf2_innovations: {
    timestamp: number;
    vel_pos_innov: [number, number, number, number, number, number];
    mag_innov: [number, number, number];
    heading_innov: number;
    airspeed_innov: number;
    beta_innov: number;
    hagl_innov: number;
    // Innovation variances
    vel_pos_innov_var: [number, number, number, number, number, number];
    mag_innov_var: [number, number, number];
    heading_innov_var: number;
    airspeed_innov_var: number;
    beta_innov_var: number;
    hagl_innov_var: number;
  };
  
  // Estimator Status (health monitoring)
  estimator_status: {
    timestamp: number;
    states: number[];
    n_states: number;
    nan_flags: number;
    health_flags: number;
    timeout_flags: number;
    pos_horiz_accuracy: number;
    pos_vert_accuracy: number;
    mag_test_ratio: number;
    vel_test_ratio: number;
    pos_test_ratio: number;
    hgt_test_ratio: number;
    tas_test_ratio: number;
    hagl_test_ratio: number;
  };
  
  // Actuator Controls (motor analysis)
  actuator_controls_0: {
    timestamp: number;
    control: [number, number, number, number, number, number, number, number];
  };
  
  // Actuator Outputs (motor outputs)
  actuator_outputs: {
    timestamp: number;
    noutputs: number;
    output: number[];
  };
  
  // GPS Position (comprehensive)
  vehicle_gps_position: {
    timestamp: number;
    lat: number;
    lon: number;
    alt: number;
    alt_ellipsoid: number;
    s_variance_m_s: number;
    c_variance_rad: number;
    fix_type: number;
    eph: number;
    epv: number;
    hdop: number;
    vdop: number;
    noise_per_ms: number;
    jamming_indicator: number;
    vel_m_s: number;
    vel_n_m_s: number;
    vel_e_m_s: number;
    vel_d_m_s: number;
    cog_rad: number;
    vel_ned_valid: boolean;
    timestamp_time_relative: number;
    heading: number;
    heading_offset: number;
    satellites_used: number;
  };
  
  // Additional 30+ message types with full parameter extraction...
}
```

### 3. DJI Format Support (.txt, .dat, .srt)

#### 3.1 DJI TXT Format (400+ parameters)

Based on Flight Reader analysis:

```typescript
// DJI TXT parameter categories (400+ total parameters)
interface DJIParameters {
  // Flight Controller Data (100+ parameters)
  flightController: {
    // Attitude and Control
    'OSD.latitude': number;
    'OSD.longitude': number;
    'OSD.height [m]': number;
    'OSD.xSpeed [m/s]': number;
    'OSD.ySpeed [m/s]': number;
    'OSD.zSpeed [m/s]': number;
    'OSD.pitch [°]': number;
    'OSD.roll [°]': number;
    'OSD.yaw [°]': number;
    
    // Flight Control
    'OSD.rcData[0]': number;  // Aileron
    'OSD.rcData[1]': number;  // Elevator
    'OSD.rcData[2]': number;  // Throttle
    'OSD.rcData[3]': number;  // Rudder
    'OSD.rcData[4]': number;  // Mode switch
    'OSD.rcData[5]': number;  // Go home
    'OSD.rcData[6]': number;  // Gear
    'OSD.rcData[7]': number;  // Custom 1
    
    // IMU Data
    'IMU_ATTI(0):gyro.x [°/s]': number;
    'IMU_ATTI(0):gyro.y [°/s]': number;
    'IMU_ATTI(0):gyro.z [°/s]': number;
    'IMU_ATTI(0):acc.x [m/s²]': number;
    'IMU_ATTI(0):acc.y [m/s²]': number;
    'IMU_ATTI(0):acc.z [m/s²]': number;
    
    // Motor Data
    'MOTOR[1]': number;
    'MOTOR[2]': number;
    'MOTOR[3]': number;
    'MOTOR[4]': number;
    'MOTOR[5]': number;  // Some models
    'MOTOR[6]': number;  // Some models
    'MOTOR[7]': number;  // Some models
    'MOTOR[8]': number;  // Some models
    
    // Flight Mode and Status
    'OSD.flycState': number;
    'OSD.flightAction': number;
    'OSD.goHomeStatus': number;
    'OSD.isMotorUp': number;
    'OSD.isSwaveWork': number;
    
    // Additional 70+ FC parameters...
  };
  
  // Gimbal Data (100+ parameters)
  gimbal: {
    // Gimbal Attitude
    'GIMBAL:pitch [°]': number;
    'GIMBAL:roll [°]': number;
    'GIMBAL:yaw [°]': number;
    
    // Gimbal Control
    'GIMBAL:pitchSpeed [°/s]': number;
    'GIMBAL:rollSpeed [°/s]': number;
    'GIMBAL:yawSpeed [°/s]': number;
    
    // Gimbal Mode and Status
    'GIMBAL:mode': number;
    'GIMBAL:isAutoCalibration': number;
    'GIMBAL:autoCalibrationResult': number;
    'GIMBAL:canOneKeyReturn': number;
    'GIMBAL:joystickInputEnabled': number;
    
    // Additional 80+ gimbal parameters...
  };
  
  // Battery Data (50+ parameters)
  battery: {
    // Main Battery
    'OSD.voltage [V]': number;
    'OSD.current [A]': number;
    'OSD.battery': number;  // Percentage
    'SMART_BATTERY(0):cellVoltage[0] [V]': number;
    'SMART_BATTERY(0):cellVoltage[1] [V]': number;
    'SMART_BATTERY(0):cellVoltage[2] [V]': number;
    'SMART_BATTERY(0):cellVoltage[3] [V]': number;
    'SMART_BATTERY(0):cellVoltage[4] [V]': number;
    'SMART_BATTERY(0):cellVoltage[5] [V]': number;
    
    // Battery Health
    'SMART_BATTERY(0):temperature [°C]': number;
    'SMART_BATTERY(0):designCapacity [mAh]': number;
    'SMART_BATTERY(0):fullChargeCapacity [mAh]': number;
    'SMART_BATTERY(0):remainingCapacity [mAh]': number;
    'SMART_BATTERY(0):cycleCount': number;
    
    // Battery Status
    'SMART_BATTERY(0):currentPV [A]': number;
    'SMART_BATTERY(0):currentPA [A]': number;
    'SMART_BATTERY(0):goHomeNeedTime [s]': number;
    'SMART_BATTERY(0):goHomeNeedCapacity [%]': number;
    'SMART_BATTERY(0):landNeedTime [s]': number;
    'SMART_BATTERY(0):landNeedCapacity [%]': number;
    
    // Additional 30+ battery parameters...
  };
  
  // Camera Data (50+ parameters)
  camera: {
    // Camera Settings
    'CAMERA:aperture': number;
    'CAMERA:shutterSpeed': number;
    'CAMERA:ISO': number;
    'CAMERA:exposureCompensation': number;
    'CAMERA:focusMode': number;
    'CAMERA:focusStatus': number;
    'CAMERA:zoomRatio': number;
    
    // Camera Control
    'CAMERA:recordTime [s]': number;
    'CAMERA:isRecording': number;
    'CAMERA:mode': number;  // Photo/Video mode
    'CAMERA:photoTakenCount': number;
    'CAMERA:isShootingPhoto': number;
    'CAMERA:isShootingVideo': number;
    
    // Camera Status
    'CAMERA:temperature [°C]': number;
    'CAMERA:SDCardFreeSpace [GB]': number;
    'CAMERA:SDCardTotalSpace [GB]': number;
    'CAMERA:SDCardStatus': number;
    
    // Additional 30+ camera parameters...
  };
  
  // Sensor Data (50+ parameters)
  sensors: {
    // Vision System
    'AVOID:relativeHeight [m]': number;
    'AVOID:overallVelocity [m/s]': number;
    'AVOID:isSensorWorking': number;
    'AVOID:visualSensorState': number;
    'AVOID:aircraftHeadDirection [°]': number;
    
    // Distance Sensors
    'OSD.relativeHeight [m]': number;
    'HEIGHT:value [m]': number;
    'HEIGHT:status': number;
    
    // GPS Data
    'OSD.gpsLevel': number;
    'OSD.gpsNum': number;
    'GPS(0):dateTime': string;
    'GPS(0):longitude [°]': number;
    'GPS(0):latitude [°]': number;
    'GPS(0):height [m]': number;
    'GPS(0):velocityX [m/s]': number;
    'GPS(0):velocityY [m/s]': number;
    'GPS(0):velocityZ [m/s]': number;
    'GPS(0):pitch [°]': number;
    'GPS(0):roll [°]': number;
    'GPS(0):yaw [°]': number;
    
    // Additional 30+ sensor parameters...
  };
  
  // Remote Controller Data (30+ parameters)
  remoteController: {
    'RC:aileron': number;
    'RC:elevator': number;
    'RC:throttle': number;
    'RC:rudder': number;
    'RC:mode': number;
    'RC:goHome': number;
    'RC:gear': number;
    'RC:custom1': number;
    'RC:custom2': number;
    
    'RC_RAW:aileron': number;
    'RC_RAW:elevator': number;
    'RC_RAW:throttle': number;
    'RC_RAW:rudder': number;
    'RC_RAW:mode': number;
    'RC_RAW:goHome': number;
    'RC_RAW:gear': number;
    
    // Additional 15+ RC parameters...
  };
  
  // Flight Analytics (20+ parameters)
  analytics: {
    'DETAILS:maxHeight [m]': number;
    'DETAILS:maxHorizontalSpeed [m/s]': number;
    'DETAILS:maxVerticalSpeed [m/s]': number;
    'DETAILS:distance [m]': number;
    'DETAILS:flightTime [s]': number;
    'DETAILS:totalFlightTime [s]': number;
    'DETAILS:totalFlights': number;
    
    // Additional analytics parameters...
  };
}
```

#### 3.2 DJI DAT Format Support

```typescript
// DJI DAT format (encrypted binary logs)
interface DJIDATParser {
  // Detection and handling
  detectEncryption(buffer: Buffer): boolean;
  
  // Graceful handling when encrypted
  handleEncrypted(): {
    message: 'Encrypted DAT files require DJI Assistant 2 for decryption';
    recommendations: string[];
    alternatives: string[];
  };
  
  // Support for decrypted DAT files (when available)
  parseDecryptedDAT(buffer: Buffer): DJIParameters;
}
```

### 4. Universal Parser Architecture

#### 4.1 Format Detection System

```typescript
// Automatic format detection
interface FormatDetector {
  detect(buffer: Buffer): LogFormat;
  
  // Format signatures
  signatures: {
    ARDUPILOT_BIN: { header: [0xA3, 0x95]; offset: 0 };
    PX4_ULG: { header: 'ULogASCII'; offset: 0 };
    DJI_TXT: { content: 'OSD.latitude'; searchDepth: 1000 };
    DJI_DAT: { header: [0x55, 0xAA]; offset: 0 };
  };
  
  // Confidence scoring
  calculateConfidence(buffer: Buffer, format: LogFormat): number;
}
```

#### 4.2 Universal Data Model

```typescript
// Unified internal representation
interface UniversalLogData {
  metadata: {
    format: LogFormat;
    version: string;
    vehicle: VehicleInfo;
    duration: number;
    messageCount: number;
    parameterCount: number;
  };
  
  // Normalized parameter categories
  parameters: {
    attitude: AttitudeParameters;
    position: PositionParameters;
    control: ControlParameters;
    sensors: SensorParameters;
    power: PowerParameters;
    performance: PerformanceParameters;
    diagnostics: DiagnosticParameters;
  };
  
  // Raw message access for expert users
  rawMessages: LogMessage[];
  
  // Analysis results
  analysis: {
    problems: DetectedProblem[];
    insights: AnalysisInsight[];
    recommendations: Recommendation[];
    confidence: ConfidenceScore;
  };
}
```

## Implementation Requirements

### 1. Performance Specifications

```typescript
interface PerformanceRequirements {
  // File size handling
  maxFileSize: '10GB';  // Must handle very large files
  
  // Processing speed
  parseTime: {
    '10MB': '<5 seconds';
    '100MB': '<30 seconds';
    '1GB': '<5 minutes';
    '10GB': '<30 minutes';
  };
  
  // Memory usage
  memoryUsage: {
    '100MB_file': '<1GB RAM';
    '1GB_file': '<4GB RAM';
    '10GB_file': '<8GB RAM';
  };
  
  // Parameter extraction
  extractionRate: {
    ardupilot: '200+ parameters vs current 20';
    px4: '150+ parameters vs current 0';
    dji: '400+ parameters vs current 0';
  };
}
```

### 2. Quality Assurance Requirements

```typescript
interface QualityRequirements {
  // Accuracy benchmarks
  accuracy: {
    ardupilot: '95% parameter match vs Mission Planner';
    px4: '95% parameter match vs Flight Review';
    dji: '95% parameter match vs Flight Reader';
  };
  
  // Error handling
  errorHandling: {
    corruptedFiles: 'Graceful degradation with partial results';
    unsupportedVersions: 'Clear messaging with upgrade path';
    memoryLimits: 'Progressive loading with user notification';
  };
  
  // Validation testing
  validation: {
    testFiles: 'Real-world logs from all supported formats';
    crossValidation: 'Results verified against reference tools';
    edgeCases: 'Handle truncated, corrupted, and edge case files';
  };
}
```

### 3. API Specifications

```typescript
// Parser API interface
interface LogParserAPI {
  // Primary parsing methods
  parseFromBuffer(buffer: Buffer): Promise<UniversalLogData>;
  parseFromStream(stream: ReadableStream): AsyncIterator<ParseProgress>;
  
  // Format-specific parsers
  ardupilot: ArduPilotParser;
  px4: PX4Parser;
  dji: DJIParser;
  
  // Utility methods
  detectFormat(buffer: Buffer): LogFormat;
  validateFile(buffer: Buffer): ValidationResult;
  getMetadata(buffer: Buffer): LogMetadata;
  
  // Progress tracking
  onProgress(callback: (progress: ParseProgress) => void): void;
  
  // Error handling
  onError(callback: (error: ParseError) => void): void;
}
```

## Implementation Priority

### Phase 1.1: ArduPilot Enhancement (Week 1)
- [ ] Implement all 60+ message types
- [ ] Extract all parameters from FMT definitions
- [ ] Benchmark against Mission Planner accuracy
- [ ] Performance testing with large files

### Phase 1.2: PX4 Complete Implementation (Week 2)
- [ ] Replace TODO ULG implementation with complete parser
- [ ] Support all uORB topics
- [ ] Vibration analysis data extraction
- [ ] Benchmark against Flight Review accuracy

### Phase 1.3: DJI Parser Implementation (Week 3)
- [ ] Complete DJI TXT format support
- [ ] 400+ parameter extraction
- [ ] DAT format detection and messaging
- [ ] Benchmark against Flight Reader accuracy

This specification ensures SkyLensAI will extract significantly more data than any existing free tool, justifying user payment through superior analytical capabilities while preparing for Phase 2 AI-powered insights.