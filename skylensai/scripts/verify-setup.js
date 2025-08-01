#!/usr/bin/env node

/**
 * Infrastructure Setup Verification Script
 * Validates that all external services are properly configured
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

// Load environment variables
import { config } from 'dotenv';
config();

// Environment variables object
const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AUTH_SECRET: process.env.AUTH_SECRET,
};

const requiredEnvVars = Object.keys(env);

const prisma = new PrismaClient();

async function verifyEnvironmentVariables() {
  console.log('🔍 Verifying environment variables...');
  
  const missing = requiredEnvVars.filter(varName => !env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return false;
  }
  
  console.log('✅ All required environment variables are present');
  return true;
}

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying database connection...');
  
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase connection...');
  
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function verifyStorageAccess() {
  console.log('🔍 Verifying Supabase Storage access...');
  
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    const logFilesBucket = data.find(bucket => bucket.name === 'log-files');
    if (!logFilesBucket) {
      console.error('❌ "log-files" bucket not found');
      return false;
    }
    
    console.log('✅ Storage access successful');
    return true;
  } catch (error) {
    console.error('❌ Storage access failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting infrastructure setup verification...\n');
  
  const checks = [
    verifyEnvironmentVariables,
    verifyDatabaseConnection,
    verifySupabaseConnection,
    verifyStorageAccess
  ];
  
  const results = [];
  
  for (const check of checks) {
    const result = await check();
    results.push(result);
    console.log('');
  }
  
  const allPassed = results.every(result => result);
  
  if (allPassed) {
    console.log('🎉 All infrastructure checks passed! Ready for development.');
    process.exit(0);
  } else {
    console.log('❌ Some infrastructure checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Verification script crashed:', error);
  process.exit(1);
});