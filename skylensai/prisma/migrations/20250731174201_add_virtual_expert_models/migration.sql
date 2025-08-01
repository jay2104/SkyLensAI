-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastQueryReset" TIMESTAMP(3),
ADD COLUMN     "monthlyQueries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "queryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "VirtualExpertQuery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logFileId" TEXT,
    "question" TEXT NOT NULL,
    "context" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualExpertQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertResponse" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "methodology" JSONB NOT NULL,
    "citations" JSONB NOT NULL,
    "processingTime" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VirtualExpertQuery_userId_idx" ON "VirtualExpertQuery"("userId");

-- CreateIndex
CREATE INDEX "VirtualExpertQuery_logFileId_idx" ON "VirtualExpertQuery"("logFileId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertResponse_queryId_key" ON "ExpertResponse"("queryId");

-- CreateIndex
CREATE INDEX "ExpertResponse_queryId_idx" ON "ExpertResponse"("queryId");

-- AddForeignKey
ALTER TABLE "VirtualExpertQuery" ADD CONSTRAINT "VirtualExpertQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualExpertQuery" ADD CONSTRAINT "VirtualExpertQuery_logFileId_fkey" FOREIGN KEY ("logFileId") REFERENCES "LogFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertResponse" ADD CONSTRAINT "ExpertResponse_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "VirtualExpertQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
