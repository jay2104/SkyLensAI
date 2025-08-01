/**
 * Rate Limiter Tests
 * Tests for authentication rate limiting functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from './rate-limiter';
import { NextRequest } from 'next/server';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    vi.clearAllTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const config = { maxAttempts: 3, windowMs: 60000 };
      
      const result1 = checkRateLimit('test-user', config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);
      
      const result2 = checkRateLimit('test-user', config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
      
      const result3 = checkRateLimit('test-user', config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', () => {
      const config = { maxAttempts: 2, windowMs: 60000 };
      
      checkRateLimit('test-user', config);
      checkRateLimit('test-user', config);
      
      const result = checkRateLimit('test-user', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset window after expiry', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);
      
      const config = { maxAttempts: 1, windowMs: 1000 };
      
      // First request should succeed
      const result1 = checkRateLimit('test-user-expiry', config);
      expect(result1.success).toBe(true);
      
      // Second request should fail
      const result2 = checkRateLimit('test-user-expiry', config);
      expect(result2.success).toBe(false);
      
      // Advance time past window
      vi.setSystemTime(now + 1001);
      
      // Third request should succeed (new window)
      const result3 = checkRateLimit('test-user-expiry', config);
      expect(result3.success).toBe(true);
      
      vi.useRealTimers();
    });

    it('should handle different identifiers separately', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      
      const user1Result1 = checkRateLimit('user1', config);
      const user2Result1 = checkRateLimit('user2', config);
      
      expect(user1Result1.success).toBe(true);
      expect(user2Result1.success).toBe(true);
      
      const user1Result2 = checkRateLimit('user1', config);
      const user2Result2 = checkRateLimit('user2', config);
      
      expect(user1Result2.success).toBe(false);
      expect(user2Result2.success).toBe(false);
    });
  });

  describe('getClientIdentifier', () => {
    it('should use x-forwarded-for header if available', () => {
      const request = new NextRequest('https://example.com', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });
      
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should use x-real-ip header if forwarded-for not available', () => {
      const request = new NextRequest('https://example.com', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });
      
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.2');
    });

    it('should fallback to unknown if no IP headers', () => {
      const request = new NextRequest('https://example.com');
      
      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('unknown');
    });
  });

  describe('RATE_LIMITS configuration', () => {
    it('should have proper auth login limits', () => {
      expect(RATE_LIMITS.AUTH_LOGIN.maxAttempts).toBe(5);
      expect(RATE_LIMITS.AUTH_LOGIN.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should have proper auth registration limits', () => {
      expect(RATE_LIMITS.AUTH_REGISTER.maxAttempts).toBe(3);
      expect(RATE_LIMITS.AUTH_REGISTER.windowMs).toBe(60 * 60 * 1000); // 1 hour
    });
  });
});