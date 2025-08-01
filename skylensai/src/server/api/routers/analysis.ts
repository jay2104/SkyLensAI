import { z } from "zod";
import { 
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { VirtualExpertService } from "~/server/services/virtualExpert";
import { OpenAIService } from "~/server/services/openaiService";

export const analysisRouter = createTRPCRouter({
  // Submit Virtual Expert Query
  submitVirtualExpertQuery: protectedProcedure
    .input(
      z.object({
        question: z.string().min(1, "Question is required").max(2000, "Question too long").trim(),
        logFileId: z.string().cuid().optional(), // Optional - queries can be general or log-specific
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check subscription status - only Pro users can use Virtual Expert
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          subscriptionTier: true,
          queryCount: true,
          monthlyQueries: true,
          lastQueryReset: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.subscriptionTier === "FREE") {
        throw new Error("Virtual Expert is a Pro feature. Please upgrade your subscription to access this functionality.");
      }

      // Verify log file ownership if provided
      if (input.logFileId) {
        const logFile = await ctx.db.logFile.findFirst({
          where: {
            id: input.logFileId,
            userId: ctx.session.user.id,
          },
          include: {
            analysisResult: true,
          },
        });

        if (!logFile) {
          throw new Error("Log file not found or access denied");
        }
      }

      // Create query record
      const query = await ctx.db.virtualExpertQuery.create({
        data: {
          userId: ctx.session.user.id,
          logFileId: input.logFileId,
          question: input.question,
          status: "pending",
        },
      });

      // Update user query tracking
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastResetMonth = user.lastQueryReset ? user.lastQueryReset.getMonth() : -1;
      const lastResetYear = user.lastQueryReset ? user.lastQueryReset.getFullYear() : -1;

      // Reset monthly count if it's a new month
      const shouldReset = !user.lastQueryReset || 
        (currentMonth !== lastResetMonth || currentYear !== lastResetYear);

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          queryCount: { increment: 1 },
          monthlyQueries: shouldReset ? 1 : { increment: 1 },
          lastQueryReset: shouldReset ? now : user.lastQueryReset,
        },
      });

      // Process query asynchronously
      try {
        const startTime = Date.now();
        
        // Get context data if log file is specified
        let context = null;
        if (input.logFileId) {
          const logFileData = await ctx.db.logFile.findFirst({
            where: { id: input.logFileId },
            include: {
              analysisResult: true,
              timeSeriesData: {
                take: 1000, // Limit for context
                orderBy: { timestamp: "asc" },
              },
            },
          });

          if (logFileData) {
            context = {
              fileName: logFileData.fileName,
              fileType: logFileData.fileType,
              flightDuration: logFileData.flightDuration,
              maxAltitude: logFileData.maxAltitude,
              totalDistance: logFileData.totalDistance,
              batteryData: {
                startVoltage: logFileData.batteryStartVoltage,
                endVoltage: logFileData.batteryEndVoltage,
              },
              gpsQuality: logFileData.gpsQuality,
              flightModes: logFileData.flightModes,
              existingAnalysis: logFileData.analysisResult,
              timeSeriesSample: logFileData.timeSeriesData.slice(0, 100), // Sample for context
            };
          }
        }

        // Generate expert response
        const expertResponse = await VirtualExpertService.generateResponse({
          question: input.question,
          context,
          userId: ctx.session.user.id,
        });

        const processingTime = Date.now() - startTime;

        // Create response record
        await ctx.db.expertResponse.create({
          data: {
            queryId: query.id,
            response: expertResponse.response,
            confidenceScore: expertResponse.confidenceScore,
            methodology: expertResponse.methodology,
            citations: expertResponse.citations,
            processingTime,
          },
        });

        // Update query status
        await ctx.db.virtualExpertQuery.update({
          where: { id: query.id },
          data: { status: "processed" },
        });

        return {
          success: true,
          queryId: query.id,
          response: expertResponse,
          processingTime,
        };
      } catch (error) {
        // Update query status to error
        await ctx.db.virtualExpertQuery.update({
          where: { id: query.id },
          data: { status: "error" },
        });

        console.error("Virtual Expert query processing error:", error);
        throw new Error("Failed to process your question. Please try again or contact support if the issue persists.");
      }
    }),

  // Get Query History
  getQueryHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(20),
        cursor: z.string().cuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check subscription status
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { subscriptionTier: true },
      });

      if (!user || user.subscriptionTier === "FREE") {
        throw new Error("Query history is a Pro feature. Please upgrade your subscription.");
      }

      const queries = await ctx.db.virtualExpertQuery.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.cursor ? { id: { lt: input.cursor } } : {}),
        },
        include: {
          response: true,
          logFile: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1, // Take one extra to check if there are more
      });

      let nextCursor: string | undefined = undefined;
      if (queries.length > input.limit) {
        const nextItem = queries.pop(); // Remove the extra item
        nextCursor = nextItem!.id;
      }

      return {
        queries,
        nextCursor,
      };
    }),

  // Submit Query Feedback
  submitQueryFeedback: protectedProcedure
    .input(
      z.object({
        queryId: z.string().cuid(),
        feedback: z.enum(["helpful", "not_helpful", "partially_helpful"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify query ownership
      const query = await ctx.db.virtualExpertQuery.findFirst({
        where: {
          id: input.queryId,
          userId: ctx.session.user.id,
        },
        include: {
          response: true,
        },
      });

      if (!query || !query.response) {
        throw new Error("Query not found or no response available");
      }

      // Update response with feedback
      await ctx.db.expertResponse.update({
        where: { queryId: input.queryId },
        data: { feedback: input.feedback },
      });

      return {
        success: true,
        message: "Feedback submitted successfully",
      };
    }),

  // Get Query Usage Stats
  getQueryUsageStats: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          subscriptionTier: true,
          queryCount: true,
          monthlyQueries: true,
          lastQueryReset: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Calculate monthly limit based on subscription
      const monthlyLimit = user.subscriptionTier === "PRO" ? -1 : 0; // -1 means unlimited for Pro, 0 for Free

      return {
        subscriptionTier: user.subscriptionTier,
        totalQueries: user.queryCount,
        monthlyQueries: user.monthlyQueries,
        monthlyLimit,
        hasUnlimitedQueries: user.subscriptionTier === "PRO",
        lastQueryReset: user.lastQueryReset,
      };
    }),

  // Get Virtual Expert Status
  getVirtualExpertStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { subscriptionTier: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check for any pending queries
      const pendingQueries = await ctx.db.virtualExpertQuery.count({
        where: {
          userId: ctx.session.user.id,
          status: "pending",
        },
      });

      return {
        available: true, // Service is available
        subscriptionTier: user.subscriptionTier,
        hasAccess: user.subscriptionTier !== "FREE",
        pendingQueries,
        estimatedWaitTime: pendingQueries > 0 ? Math.min(pendingQueries * 3, 30) : 0, // Rough estimate in seconds
      };
    }),

  // Get specific query details
  getQueryDetails: protectedProcedure
    .input(
      z.object({
        queryId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = await ctx.db.virtualExpertQuery.findFirst({
        where: {
          id: input.queryId,
          userId: ctx.session.user.id,
        },
        include: {
          response: true,
          logFile: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
            },
          },
        },
      });

      if (!query) {
        throw new Error("Query not found or access denied");
      }

      return query;
    }),

  // Generate Real AI Insights for Log Files (CRISIS RECOVERY - REAL AI)
  generateAIInsights: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
        maxInsights: z.number().min(1).max(10).optional().default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check subscription status - AI insights require Pro
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { subscriptionTier: true },
      });

      if (!user || user.subscriptionTier === "FREE") {
        throw new Error("AI Insights are a Pro feature. Please upgrade your subscription.");
      }

      // Verify log file ownership and get data
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
        include: {
          analysisResult: true,
          timeSeriesData: {
            take: 1000, // Limit for AI context
            orderBy: { timestamp: "asc" },
          },
        },
      });

      if (!logFile) {
        throw new Error("Log file not found or access denied");
      }

      try {
        // Build context for AI analysis
        const context = {
          fileName: logFile.fileName,
          fileType: logFile.fileType,
          flightDuration: logFile.flightDuration,
          maxAltitude: logFile.maxAltitude,
          totalDistance: logFile.totalDistance,
          batteryData: {
            startVoltage: logFile.batteryStartVoltage,
            endVoltage: logFile.batteryEndVoltage,
          },
          gpsQuality: logFile.gpsQuality,
          flightModes: logFile.flightModes,
          existingAnalysis: logFile.analysisResult,
          timeSeriesSample: logFile.timeSeriesData.slice(0, 100), // Sample for AI context
        };

        // Generate REAL AI insights using OpenAI
        const insights = await OpenAIService.generateFlightInsights(
          context,
          input.maxInsights
        );

        return {
          success: true,
          insights,
          logFileId: input.logFileId,
          generatedAt: new Date(),
        };

      } catch (error) {
        console.error("AI insights generation failed:", error);
        throw new Error("Failed to generate AI insights. Please try again or contact support.");
      }
    }),

  // Test AI Service Connection
  testAIService: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Check if user has Pro access
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { subscriptionTier: true },
      });

      if (!user || user.subscriptionTier === "FREE") {
        throw new Error("AI service testing requires Pro subscription");
      }

      try {
        const connectionTest = await OpenAIService.testConnection();
        const expertTest = await VirtualExpertService.testService();

        return {
          openai: connectionTest,
          virtualExpert: expertTest,
          overall: connectionTest.success && expertTest.success,
        };
      } catch (error) {
        return {
          openai: { success: false, error: "Connection test failed" },
          virtualExpert: { success: false, error: "Service test failed" },
          overall: false,
        };
      }
    }),
});