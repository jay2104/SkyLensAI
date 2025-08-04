#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

async function migrateParameters() {
  const prisma = new PrismaClient();
  
  try {
    const logFileId = 'cmdxdcfq40001ks048wemv69h';
    
    console.log('🔄 Clearing existing time series data for re-processing...');
    
    // Delete existing time series data for this log file
    const deleteResult = await prisma.timeSeriesPoint.deleteMany({
      where: { logFileId: logFileId }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} existing data points`);
    
    // Reset log file status to trigger re-processing
    await prisma.logFile.update({
      where: { id: logFileId },
      data: { uploadStatus: 'UPLOADED' }
    });
    
    console.log('✅ Reset log file status to UPLOADED for re-processing');
    console.log('\n🎯 Next steps:');
    console.log('1. Go to your dashboard: https://sky-lens-ai.vercel.app/dashboard/' + logFileId);
    console.log('2. Click "Process Log" button');
    console.log('3. Wait for processing with new parameter mapping');
    console.log('4. Dashboard should now show data with mapped parameter names!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateParameters();