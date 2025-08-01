/**
 * Registration API Tests
 * Tests for user registration endpoint with security features
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dependencies
vi.mock('~/server/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('~/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
  RATE_LIMITS: {
    AUTH_REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
  },
}));

import { db } from '~/server/db';
import { checkRateLimit, getClientIdentifier } from '~/lib/rate-limiter';

describe('Registration API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    (getClientIdentifier as any).mockReturnValue('127.0.0.1');
    (checkRateLimit as any).mockReturnValue({
      success: true,
      limit: 3,
      remaining: 2,
      resetTime: Date.now() + 60000,
    });
  });

  describe('Rate Limiting', () => {
    it('should block requests when rate limit exceeded', async () => {
      (checkRateLimit as any).mockReturnValue({
        success: false,
        limit: 3,
        remaining: 0,
        resetTime: Date.now() + 60000,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many registration attempts. Please try again later.');
    });

    it('should include rate limit headers when blocked', async () => {
      (checkRateLimit as any).mockReturnValue({
        success: false,
        limit: 3,
        remaining: 0,
        resetTime: Date.now() + 60000,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
        }),
      });

      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('3');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should allow registration when within rate limits', async () => {
      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        subscriptionTier: 'FREE',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');
    });
  });

  describe('Password Security', () => {
    it('should store hashed password in database', async () => {
      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        subscriptionTier: 'FREE',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
        }),
      });

      await POST(request);

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed-password',
          subscriptionTier: 'FREE',
        },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true,
          createdAt: true,
        },
      });
    });

    it('should reject weak passwords', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input data');
    });
  });

  describe('User Validation', () => {
    it('should prevent duplicate user registration', async () => {
      (db.user.findUnique as any).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User with this email already exists');
    });

    it('should validate input data format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'A', // Too short
          email: 'invalid-email',
          password: 'short',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input data');
      expect(data.details).toBeDefined();
    });
  });
});