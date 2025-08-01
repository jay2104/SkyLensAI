/**
 * Rate Limiting Utilities
 * Provides basic rate limiting for authentication endpoints
 */

import { NextRequest } from 'next/server';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;
  
  // Get current data or create new
  let data = rateLimitStore.get(key);
  
  if (!data || now > data.resetTime) {
    // Create new window
    data = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  // Increment count
  data.count++;
  rateLimitStore.set(key, data);
  
  const remaining = Math.max(0, config.maxAttempts - data.count);
  const success = data.count <= config.maxAttempts;
  
  return {
    success,
    limit: config.maxAttempts,
    remaining,
    resetTime: data.resetTime,
  };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to connection IP (NextRequest doesn't have direct .ip property)
  return 'unknown';
}

// Rate limit configurations
export const RATE_LIMITS = {
  // Authentication endpoints
  AUTH_LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  AUTH_REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  
  // General API
  API_GENERAL: { maxAttempts: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
} as const;