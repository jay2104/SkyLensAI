#!/usr/bin/env tsx

/**
 * Runtime Test: LogParser Real Data Processing
 * 
 * This script directly tests the LogParser to see if it processes
 * real data or falls back to mock data generation.
 */

import fs from 'fs';
import path from 'path';

// Mock the database to avoid actual DB operations
jest.mock('~/server/db', () => ({
  db: {
    logFile: {
      update: jest.fn().mockResolvedValue({}),
    },
    timeSeriesPoint: {
      createMany: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Import the LogParser after mocking
const { LogParser } = require('/Users/jay/Documents/LogAI-v2/skylensai/src/server/services/logParser.ts');

// Define LogFileType enum to match the implementation
enum LogFileType {
  BIN = 'BIN',
  ULG = 'ULG',
  LOG = 'LOG',
  TLOG = 'TLOG'
}

const LOG_FILES_DIR = '/Users/jay/Documents/LogAI-v2/skylensai/src/__tests__/fixtures/log-files';

const testFiles = [
  { name: 'sample-basic-flight.bin', type: LogFileType.BIN },
  { name: 'sample-complex-flight.bin', type: LogFileType.BIN },
  { name: 'sample-performance-test.bin', type: LogFileType.BIN },
  { name: 'sample-standard-flight.bin', type: LogFileType.BIN },
  { name: 'sample-ulg-format.ulg', type: LogFileType.ULG }
];

interface TestResult {
  file: string;
  type: LogFileType;
  size: number;
  parsed: boolean;
  isRealData: boolean;
  dataPoints: number;
  flightDuration: number;
  maxAltitude: number;
  error?: string;
  logOutput: string[];
}

async function testLogParserWithRealFiles(): Promise<TestResult[]> {
  console.log('🧪 RUNTIME TEST: LogParser with Real Flight Data');
  console.log('=' .repeat(60));
  
  const results: TestResult[] = [];
  
  for (const testFile of testFiles) {
    const filePath = path.join(LOG_FILES_DIR, testFile.name);
    
    console.log(`\n📁 Testing: ${testFile.name}`);
    console.log(`   Type: ${testFile.type}`);
    console.log(`   Path: ${filePath}`);
    
    // Capture console output to detect mock data fallbacks
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    const logOutput: string[] = [];
    
    console.log = (...args) => {
      logOutput.push(`LOG: ${args.join(' ')}`);
      originalConsoleLog(...args);
    };
    
    console.warn = (...args) => {
      logOutput.push(`WARN: ${args.join(' ')}`);
      originalConsoleWarn(...args);
    };
    
    console.error = (...args) => {
      logOutput.push(`ERROR: ${args.join(' ')}`);
      originalConsoleError(...args);
    };
    
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const stats = fs.statSync(filePath);
      console.log(`   📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Test with buffer method (preferred approach)
      const buffer = fs.readFileSync(filePath);
      const logFileId = `test-${Date.now()}-${testFile.name}`;
      
      console.log(`   🔄 Parsing with LogParser.parseLogFileFromBuffer...`);
      
      const startTime = Date.now();
      const parsedData = await LogParser.parseLogFileFromBuffer(
        logFileId,
        testFile.type,
        buffer
      );
      const parseTime = Date.now() - startTime;
      
      console.log(`   ⏱️  Parse time: ${parseTime}ms`);
      console.log(`   ✅ Parsing completed successfully`);
      
      // Analyze the parsed data to determine if it's real or mock
      const isRealData = analyzeIfRealData(parsedData, testFile, logOutput);
      
      console.log(`   📊 Flight duration: ${parsedData.flightDuration}s`);
      console.log(`   🏔️  Max altitude: ${parsedData.maxAltitude}m`);
      console.log(`   📈 Time series points: ${parsedData.timeSeriesData.length}`);
      console.log(`   🎯 Real data detected: ${isRealData ? 'YES' : 'NO'}`);
      
      results.push({
        file: testFile.name,
        type: testFile.type,
        size: stats.size,
        parsed: true,
        isRealData,
        dataPoints: parsedData.timeSeriesData.length,
        flightDuration: parsedData.flightDuration,
        maxAltitude: parsedData.maxAltitude,
        logOutput: [...logOutput]
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      results.push({
        file: testFile.name,
        type: testFile.type,
        size: 0,
        parsed: false,
        isRealData: false,
        dataPoints: 0,
        flightDuration: 0,
        maxAltitude: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        logOutput: [...logOutput]
      });
    } finally {
      // Restore console methods
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    }
  }
  
  return results;
}

function analyzeIfRealData(parsedData: any, testFile: any, logOutput: string[]): boolean {
  // Check for telltale signs of mock data generation
  
  // 1. Check log output for mock data warnings
  const hasMockWarnings = logOutput.some(log => 
    log.toLowerCase().includes('mock') || 
    log.toLowerCase().includes('fallback') ||
    log.toLowerCase().includes('generating')
  );
  
  if (hasMockWarnings) {
    console.log(`   🚨 Mock data warnings detected in logs`);
    return false;
  }
  
  // 2. Check for suspiciously round numbers (common in mock data)
  const hasRoundNumbers = (
    parsedData.flightDuration % 60 === 0 || // Round minute durations
    parsedData.maxAltitude % 10 === 0 ||    // Round altitude values
    parsedData.batteryStartVoltage === 16.8 || // Hardcoded mock values
    parsedData.batteryEndVoltage === 14.2
  );
  
  if (hasRoundNumbers) {
    console.log(`   🚨 Suspicious round numbers detected (possible mock data)`);
  }
  
  // 3. Check for realistic data patterns
  const hasRealisticData = (
    parsedData.timeSeriesData.length > 100 && // Sufficient data points
    parsedData.flightDuration > 0 &&          // Valid flight duration
    parsedData.maxAltitude > 0 &&            // Valid altitude
    parsedData.timeSeriesData.some((p: any) => p.parameter === 'gps_lat') && // GPS data
    parsedData.timeSeriesData.some((p: any) => p.parameter === 'altitude')   // Altitude data
  );
  
  // 4. Check for file size correlation
  const fileSize = testFile.size || 0;
  const expectedDataPoints = Math.floor(fileSize / 1000); // Rough estimate
  const hasProportionalData = parsedData.timeSeriesData.length > expectedDataPoints * 0.1;
  
  console.log(`   📊 Data analysis:`);
  console.log(`      - Mock warnings: ${hasMockWarnings ? 'YES' : 'NO'}`);
  console.log(`      - Round numbers: ${hasRoundNumbers ? 'YES' : 'NO'}`);
  console.log(`      - Realistic patterns: ${hasRealisticData ? 'YES' : 'NO'}`);
  console.log(`      - Proportional data: ${hasProportionalData ? 'YES' : 'NO'}`);
  
  return !hasMockWarnings && hasRealisticData && hasProportionalData;
}

async function generateFinalReport(results: TestResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 RUNTIME TEST FINAL REPORT');
  console.log('='.repeat(60));
  
  const successfulParsing = results.filter(r => r.parsed);
  const realDataFiles = results.filter(r => r.isRealData);
  const mockDataFiles = results.filter(r => r.parsed && !r.isRealData);
  
  console.log(`\n📊 PARSING RESULTS:`);
  console.log(`   ✅ Successfully parsed: ${successfulParsing.length}/${results.length}`);
  console.log(`   🎯 Real data detected: ${realDataFiles.length}/${successfulParsing.length}`);
  console.log(`   🚨 Mock data detected: ${mockDataFiles.length}/${successfulParsing.length}`);
  
  if (realDataFiles.length > 0) {
    console.log(`\n✅ FILES WITH REAL DATA:`);
    realDataFiles.forEach(result => {
      console.log(`   - ${result.file}:`);
      console.log(`     Duration: ${result.flightDuration}s, Altitude: ${result.maxAltitude}m`);
      console.log(`     Data points: ${result.dataPoints}, Size: ${(result.size / 1024 / 1024).toFixed(1)}MB`);
    });
  }
  
  if (mockDataFiles.length > 0) {
    console.log(`\n🚨 FILES WITH MOCK DATA:`);
    mockDataFiles.forEach(result => {
      console.log(`   - ${result.file}:`);
      console.log(`     Duration: ${result.flightDuration}s, Altitude: ${result.maxAltitude}m`);
      console.log(`     Data points: ${result.dataPoints}`);
      
      // Show relevant log entries
      const mockLogs = result.logOutput.filter(log => 
        log.toLowerCase().includes('mock') || 
        log.toLowerCase().includes('fallback') ||
        log.toLowerCase().includes('warn')
      );
      
      if (mockLogs.length > 0) {
        console.log(`     🚨 Warning logs:`);
        mockLogs.forEach(log => console.log(`       ${log}`));
      }
    });
  }
  
  console.log(`\n🎯 CRISIS AUDIT VERDICT:`);
  
  if (realDataFiles.length === successfulParsing.length && successfulParsing.length > 0) {
    console.log(`   ✅ IMPLEMENTATION IS LEGITIMATE`);
    console.log(`      - All files processed with real data`);
    console.log(`      - No mock data fallbacks detected`);
    console.log(`      - LogParser appears to be properly implemented`);
  } else if (mockDataFiles.length === successfulParsing.length) {
    console.log(`   🚨 IMPLEMENTATION IS FAKE`);
    console.log(`      - All files fell back to mock data generation`);
    console.log(`      - LogParser is not processing real flight data`);
    console.log(`      - This confirms the crisis suspicions`);
  } else {
    console.log(`   ⚠️  MIXED IMPLEMENTATION`);
    console.log(`      - Some files processed with real data, others with mock`);
    console.log(`      - Indicates partial implementation or selective fallbacks`);
    console.log(`      - Requires further investigation`);
  }
  
  // Save detailed report
  const reportPath = '/Users/jay/Documents/LogAI-v2/logparser-runtime-report.json';
  const fullReport = {
    timestamp: new Date().toISOString(),
    testType: 'Runtime LogParser Validation',
    results,
    summary: {
      totalFiles: results.length,
      successfullyParsed: successfulParsing.length,
      realDataFiles: realDataFiles.length,
      mockDataFiles: mockDataFiles.length,
      verdict: realDataFiles.length === successfulParsing.length ? 'LEGITIMATE' : 
               mockDataFiles.length === successfulParsing.length ? 'FAKE' : 'MIXED'
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  return fullReport;
}

// Main execution
async function main() {
  try {
    const results = await testLogParserWithRealFiles();
    await generateFinalReport(results);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);