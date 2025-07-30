# Credential Management Strategy

## Overview
This document defines the comprehensive approach for managing API keys, secrets, and credentials throughout the SkyLensAI application lifecycle. It ensures security best practices while maintaining development efficiency.

## 🔐 Credential Categories

### 1. External Service Credentials
**Description:** Keys and secrets for third-party services
**Examples:** Supabase keys, Vercel tokens, future AI service APIs
**Risk Level:** HIGH - Direct access to external resources

### 2. Application Secrets
**Description:** Internal application security keys
**Examples:** NextAuth secret, JWT signing keys, encryption keys
**Risk Level:** CRITICAL - Compromise affects entire application security

### 3. Database Credentials
**Description:** Database connection and access credentials
**Examples:** PostgreSQL connection strings, service role keys
**Risk Level:** CRITICAL - Direct database access

### 4. Development vs Production
**Description:** Environment-specific credential sets
**Examples:** Dev Supabase project vs Production project
**Risk Level:** Variable - Production is CRITICAL, development is HIGH

## 🏗️ Implementation Strategy

### Environment Variable Management

#### Development Environment (.env.local)
```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://[project-id].supabase.co"
SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"

# Authentication
NEXTAUTH_SECRET="[32-character-random-string]"
NEXTAUTH_URL="http://localhost:3000"

# Optional: External AI Services (Future)
OPENAI_API_KEY="[ai-service-key]"
ANTHROPIC_API_KEY="[ai-service-key]"
```

#### Production Environment (Vercel)
- All environment variables configured in Vercel dashboard
- Separate Supabase project for production
- Production-grade secrets with regular rotation
- Encrypted storage and transmission

### Credential Validation System

#### Startup Validation (env.js)
```typescript
// Enhanced environment validation
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ?? str,
      z.string().url()
    ),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
});
```

#### Runtime Health Checks
```typescript
// Service connection validation
export async function validateServiceConnections() {
  const checks = {
    database: await testDatabaseConnection(),
    storage: await testStorageConnection(),
    auth: await testAuthConfiguration(),
  };
  
  return checks;
}
```

## 🔒 Security Implementation

### 1. Credential Isolation
- **Development:** Isolated development project/keys
- **Production:** Separate production credentials
- **Testing:** Mock services or dedicated test credentials
- **CI/CD:** Limited-scope service accounts

### 2. Access Control
- **Service Role Keys:** Used only in server-side code
- **Anon Keys:** Safe for client-side use (public)
- **NextAuth Secret:** Server-only, never exposed to client
- **Database URL:** Server-only, includes sensitive connection info

### 3. Rotation Strategy
- **Development:** Rotate when compromised or quarterly
- **Production:** Rotate monthly or when team members leave
- **Emergency:** Immediate rotation capability for breaches
- **Automated:** Future implementation of automated rotation

### 4. Monitoring & Alerts
- **Usage Monitoring:** Track API usage and unusual patterns
- **Error Monitoring:** Alert on authentication failures
- **Cost Monitoring:** Alert on unexpected service usage
- **Security Monitoring:** Monitor for credential exposure in logs

## 📋 Implementation Checklist

### Story 0.9 Requirements
- [ ] Create .env.example with all required variables
- [ ] Implement comprehensive env.js validation
- [ ] Add startup connection health checks
- [ ] Document credential requirements in setup guide
- [ ] Create troubleshooting guide for common credential issues

### Development Process
- [ ] Add .env.local to .gitignore (already standard in T3)
- [ ] Create setup validation script
- [ ] Implement error handling for missing credentials
- [ ] Add clear error messages for configuration issues
- [ ] Document credential updating process

### Production Deployment
- [ ] Configure Vercel environment variables
- [ ] Verify production Supabase project setup
- [ ] Test production credential functionality
- [ ] Implement production monitoring
- [ ] Create credential rotation procedures

## 🚨 Security Incidents Response

### Credential Compromise Procedure
1. **Immediate:** Rotate compromised credentials
2. **Assessment:** Determine scope of potential access
3. **Notification:** Inform relevant stakeholders
4. **Monitoring:** Watch for unauthorized usage
5. **Documentation:** Record incident and response

### Common Scenarios
- **Credential in Git:** Rotate immediately, remove from history
- **Team Member Departure:** Rotate all shared credentials
- **Service Breach:** Follow service provider's guidance
- **Accidental Exposure:** Rotate and monitor for misuse

## 🔧 Developer Guidelines

### Local Development
1. Copy .env.example to .env.local
2. Fill in credentials from user setup guide
3. Run validation script to verify configuration
4. Never commit .env.local to version control

### Credential Usage in Code
```typescript
// CORRECT: Use env validation
import { env } from "~/env.js";
const supabaseUrl = env.SUPABASE_URL;

// INCORRECT: Direct process.env access
const supabaseUrl = process.env.SUPABASE_URL; // No validation!
```

### Error Handling
```typescript
// Provide helpful error messages
if (!env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Please check your .env.local file and ensure Supabase is configured."
  );
}
```

## 📈 Future Enhancements

### Planned Improvements
- **Automated Rotation:** Implement automatic credential rotation
- **Secret Management:** Integrate with dedicated secret management service
- **Zero-Trust:** Implement zero-trust security model
- **Audit Logging:** Comprehensive credential usage logging

### AI Service Integration
When AI services are added:
- Separate credential category for AI APIs
- Usage-based monitoring and alerts
- Cost optimization through credential management
- Rate limiting and quota management

## ✅ Validation Criteria

### Story 0.9 Success Criteria
- All required credentials properly validated at startup
- Clear error messages for missing or invalid credentials
- Comprehensive setup documentation for users
- Health check system for all external services
- Production-ready credential management foundation

This strategy ensures secure, manageable credential handling throughout the application lifecycle while maintaining development efficiency and security best practices.