import { z } from "zod";
import { LogFileType, UploadStatus } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const logFileRouter = createTRPCRouter({
  // Get presigned upload URL for file uploads
  getPresignedUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1, "File name is required").max(255, "File name too long"),
        fileType: z.nativeEnum(LogFileType),
        fileSize: z.number().min(1).max(100 * 1024 * 1024, "File size must be under 100MB"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create LogFile record in database
      const logFile = await ctx.db.logFile.create({
        data: {
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          uploadStatus: UploadStatus.PENDING,
          userId: ctx.session.user.id,
        },
      });

      // For now, return mock presigned URL
      // TODO: Replace with actual Supabase Storage integration in future iterations
      const mockPresignedUrl = `https://mock-upload-url.com/${logFile.id}`;

      return {
        logFileId: logFile.id,
        presignedUrl: mockPresignedUrl,
      };
    }),

  // Confirm upload completion
  confirmUpload: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update upload status to UPLOADED
      const updatedLogFile = await ctx.db.logFile.update({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id, // Ensure user owns the file
        },
        data: {
          uploadStatus: UploadStatus.UPLOADED,
        },
      });

      return {
        success: true,
        logFile: updatedLogFile,
      };
    }),

  // Submit text-based issue description
  submitTextInput: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1, "Description is required").max(2000, "Description too long").trim(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create LogFile record for text input
      const logFile = await ctx.db.logFile.create({
        data: {
          fileName: `Text Input - ${new Date().toISOString()}`,
          fileType: LogFileType.LOG, // Default to LOG for text inputs
          fileSize: Buffer.byteLength(input.text, 'utf8'),
          uploadStatus: UploadStatus.UPLOADED, // Text is immediately "uploaded"
          userId: ctx.session.user.id,
        },
      });

      // TODO: Store actual text content in future schema updates
      // For now, text is stored conceptually as a "file"

      return {
        success: true,
        logFile: logFile,
      };
    }),

  // Get user's log files
  getUserLogFiles: protectedProcedure
    .query(async ({ ctx }) => {
      const logFiles = await ctx.db.logFile.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          analysisResult: true,
        },
      });

      return logFiles;
    }),
});