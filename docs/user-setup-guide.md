# SkyLensAI User Setup Guide

## Overview
This guide outlines the external service setup tasks that must be completed by the user before development can proceed. These are tasks that require human decision-making, account creation, or payment processing that cannot be automated.

## 🚨 CRITICAL: Complete Before Development

### 1. Supabase Account & Project Setup

**Why User Must Do This:** Requires personal email, potential payment information, and project naming decisions.

**Steps:**
1. **Create Account**
   - Go to https://supabase.com
   - Sign up with your preferred email address
   - Verify email address

2. **Create Project**
   - Click "New Project"
   - Project Name: `skylensai-production` (or your preferred name)
   - Database Password: Generate strong password and save securely
   - Region: Choose closest to your location
   - Pricing: Free tier is sufficient for development

3. **Gather Credentials**
   - From Project Dashboard → Settings → API
   - Copy and save:
     - **Project URL** (https://[project-id].supabase.co)
     - **Anon (Public) Key**
     - **Service Role (Secret) Key**

4. **Configure Database**
   - Go to SQL Editor
   - Wait for developer agent to provide schema script
   - Run the provided SQL script

5. **Setup Storage**
   - Go to Storage → Create Bucket
   - Bucket Name: `log-files`
   - Set to Private (not public)
   - Upload Size Limit: 100MB

### 2. Vercel Account Setup

**Why User Must Do This:** Requires GitHub account linking and deployment configuration decisions.

**Steps:**
1. **Create Account**
   - Go to https://vercel.com
   - Sign up with GitHub account (recommended)
   - Complete account verification

2. **Connect Repository**
   - Link to your SkyLensAI GitHub repository
   - Note: Actual deployment happens in later development story

### 3. Generate Security Credentials

**Why User Must Do This:** Security best practices require human-generated secrets.

**Steps:**
1. **NextAuth Secret**
   - Generate 32-character random string
   - Use: https://generate-secret.vercel.app/32
   - Save securely for environment variables

## 📋 Credential Checklist

Before proceeding to development, ensure you have:

- [ ] Supabase Project URL
- [ ] Supabase Anon Key
- [ ] Supabase Service Role Key
- [ ] Strong database password
- [ ] NextAuth Secret (32 characters)
- [ ] Vercel account created and GitHub connected
- [ ] Storage bucket "log-files" created in Supabase

## 🔒 Security Best Practices

### Credential Storage
- **NEVER** commit credentials to Git
- Store in password manager or secure note-taking app
- Environment variables will be configured by developer agent

### Database Security
- Use strong, unique password for Supabase project
- Enable Row Level Security (will be configured by developer agent)
- Regularly rotate service role keys in production

### Access Control
- Use principle of least privilege
- Monitor access logs in Supabase dashboard
- Set up billing alerts to prevent unexpected charges

## ⚠️ Common Issues & Troubleshooting

### Supabase Setup Issues
- **Project creation fails:** Check email verification, try different project name
- **Can't find credentials:** Go to Project Settings → API, ensure you're in correct project
- **Database connection fails:** Verify password, check region selection

### Vercel Setup Issues
- **GitHub connection fails:** Ensure GitHub account has proper permissions
- **Repository not found:** Make sure repository is public or Vercel has access

### Credential Issues
- **Secret generation fails:** Use alternative generator or create manually
- **Credentials not working:** Double-check copy/paste, ensure no extra spaces

## 📞 Support

If you encounter issues during setup:

1. **Check Supabase Documentation:** https://supabase.com/docs
2. **Check Vercel Documentation:** https://vercel.com/docs
3. **Common Issues:** Most problems are copy/paste errors or account verification delays

## ✅ Ready for Development

Once all credentials are gathered and services configured, inform your developer agent that user prerequisites are complete. They will handle all technical configuration and integration work.

**Next Step:** Developer agent will run Story 0.9 (Infrastructure Setup) to configure all integrations.