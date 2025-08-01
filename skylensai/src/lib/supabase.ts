/**
 * Supabase Client Configuration
 * Handles both client-side and server-side Supabase interactions
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

/**
 * Client-side Supabase client (uses anon key)
 * Safe to use in browser environments
 */
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Server-side Supabase client (uses service role key)
 * Has elevated permissions - use only on server side
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Storage configuration for log files
 */
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'log-files',
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FILE_TYPES: ['.bin', '.log', '.tlog', '.ulg'],
  UPLOAD_TIMEOUT: 60000, // 60 seconds
} as const;