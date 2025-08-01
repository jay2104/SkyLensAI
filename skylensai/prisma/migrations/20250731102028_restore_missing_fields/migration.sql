-- AlterTable
ALTER TABLE "AnalysisResult" ADD COLUMN     "analysisType" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "insights" JSONB,
ADD COLUMN     "methodology" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiPreviewUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiPromptFrequency" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "aiPromptsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastAiPrompt" TIMESTAMP(3);
