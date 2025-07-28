# **10. Database Schema**

This SQL code defines the structure for our PostgreSQL database.

```sql
-- Create custom ENUM types for status fields to ensure data consistency
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADED', 'PROCESSED', 'ERROR');
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'COMPLETE', 'ERROR');
CREATE TYPE "LogFileType" AS ENUM ('BIN', 'LOG', 'TLOG', 'ULG');

-- Table to store user information and subscription status
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "paymentProviderCustomerId" TEXT, -- To link to Stripe/Razorpay
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL
);

-- Table to store metadata for uploaded log files
CREATE TABLE "LogFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileType" "LogFileType" NOT NULL,
    "uploadStatus" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "fileSize" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "LogFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table to store the results of the AI analysis
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "healthScore" INTEGER,
    "summary" TEXT,
    "detailedFindings" JSONB,
    "logFileId" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "AnalysisResult_logFileId_fkey" FOREIGN KEY ("logFileId") REFERENCES "LogFile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes on foreign keys for faster lookups
CREATE INDEX "LogFile_userId_idx" ON "LogFile"("userId");
CREATE INDEX "AnalysisResult_logFileId_idx" ON "AnalysisResult"("logFileId");
```
