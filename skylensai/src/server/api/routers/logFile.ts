import { z } from "zod";
import { LogFileType, UploadStatus } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { LogParser } from "~/server/services/logParser";
import { ChartRenderer } from "~/server/services/chartRenderer";
import { TrendAnalyzer } from "~/server/services/trendAnalyzer";
import { ParameterIntelligenceService } from "~/server/services/documentationBasedParameterService";

export const logFileRouter = createTRPCRouter({
  // Get presigned upload URL for file uploads
  getPresignedUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1, "File name is required").max(255, "File name too long"),
        fileType: z.nativeEnum(LogFileType),
        fileSize: z.number().min(1).max(50 * 1024 * 1024, "File size must be under 50MB"),
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

      // Generate actual Supabase presigned URL
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const filePath = `log-files/${ctx.session.user.id}/${logFile.id}/${input.fileName}`;
      
      const { data, error } = await supabase.storage
        .from('log-files')
        .createSignedUploadUrl(filePath);

      if (error) {
        throw new Error(`Failed to create upload URL: ${error.message}`);
      }

      return {
        logFileId: logFile.id,
        presignedUrl: data.signedUrl,
        filePath: filePath,
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

  // Process log file for dashboard display
  processLogFile: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the file
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
      });

      if (!logFile) {
        throw new Error("Log file not found or access denied");
      }

      if (logFile.uploadStatus !== UploadStatus.UPLOADED) {
        throw new Error("Log file must be uploaded before processing");
      }

      // Parse the log file - get from Supabase first
      try {
        console.log(`Processing log file ${logFile.id}: ${logFile.fileName}`);
        
        // Try local storage first, fallback to Supabase
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const localPath = path.join(process.cwd(), 'uploads', ctx.session.user.id, `${logFile.id}_${logFile.fileName}`);
        let buffer: Buffer;
        
        try {
          // Try local storage first
          buffer = await fs.readFile(localPath);
          console.log(`File read from local storage: ${localPath}, size: ${buffer.length} bytes`);
        } catch (localError) {
          console.log(`Local file not found, trying Supabase: ${localError}`);
          
          // Fallback to Supabase
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const filePath = `log-files/${ctx.session.user.id}/${logFile.id}/${logFile.fileName}`;
          console.log(`Downloading file from Supabase path: ${filePath}`);
          
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('log-files')
            .download(filePath);

          if (downloadError) {
            console.error(`Supabase download error:`, downloadError);
            throw new Error(`Failed to download from both local and Supabase: ${downloadError.message}`);
          }

          if (!fileData) {
            throw new Error("No file data received from Supabase");
          }

          buffer = Buffer.from(await fileData.arrayBuffer());
          console.log(`File downloaded from Supabase, size: ${buffer.length} bytes`);
        }
        
        const parsedData = await LogParser.parseLogFileFromBuffer(logFile.id, logFile.fileType, buffer);
        
        // Update status to PROCESSED and store parsed data
        await ctx.db.logFile.update({
          where: { id: logFile.id },
          data: { 
            uploadStatus: UploadStatus.PROCESSED,
            flightDuration: parsedData.flightDuration,
            maxAltitude: parsedData.maxAltitude,
            totalDistance: parsedData.totalDistance,
            batteryStartVoltage: parsedData.batteryStartVoltage,
            batteryEndVoltage: parsedData.batteryEndVoltage,
            gpsQuality: parsedData.gpsQuality,
            flightModes: parsedData.flightModes,
          },
        });
        
        console.log(`Log file ${logFile.id} processed successfully`);
        
        return {
          success: true,
          message: "Log file processed successfully",
          data: parsedData,
        };
      } catch (error) {
        // Update status to ERROR if parsing fails
        await ctx.db.logFile.update({
          where: { id: logFile.id },
          data: { uploadStatus: UploadStatus.ERROR },
        });
        
        throw new Error("Failed to process log file");
      }
    }),

  // Get dashboard data for a log file
  getLogDashboardData: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      // Get time series data for trend analysis
      const timeSeriesData = await ctx.db.timeSeriesPoint.findMany({
        where: {
          logFileId: input.logFileId,
        },
        orderBy: [
          { parameter: "asc" },
          { timestamp: "asc" },
        ],
        take: 5000, // Limit for performance
      });

      // Calculate trends
      const trends = TrendAnalyzer.analyzeDashboardTrends({
        batteryStartVoltage: logFile.batteryStartVoltage || undefined,
        batteryEndVoltage: logFile.batteryEndVoltage || undefined,
        flightDuration: logFile.flightDuration || undefined,
        timeSeriesData: timeSeriesData.map(point => ({
          parameter: point.parameter,
          timestamp: point.timestamp,
          value: point.value,
        })),
      });

      return {
        id: logFile.id,
        fileName: logFile.fileName,
        fileType: logFile.fileType,
        fileSize: logFile.fileSize,
        uploadStatus: logFile.uploadStatus,
        createdAt: logFile.createdAt,
        flightDuration: logFile.flightDuration,
        maxAltitude: logFile.maxAltitude,
        totalDistance: logFile.totalDistance,
        batteryStartVoltage: logFile.batteryStartVoltage,
        batteryEndVoltage: logFile.batteryEndVoltage,
        gpsQuality: logFile.gpsQuality,
        flightModes: logFile.flightModes,
        analysisResult: logFile.analysisResult,
        trends: trends, // Add trend analysis results
      };
    }),

  // Get time series data for specific parameters
  getTimeSeriesData: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
        parameters: z.array(z.string()).optional(),
        limit: z.number().min(1).max(10000).optional().default(5000),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log(`[getTimeSeriesData] Request for logFileId: ${input.logFileId}, user: ${ctx.session.user.id}`);
      
      // Verify user owns the file
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
      });

      if (!logFile) {
        console.log(`[getTimeSeriesData] Access denied for logFileId: ${input.logFileId}, user: ${ctx.session.user.id}`);
        throw new Error("Log file not found or access denied");
      }

      console.log(`[getTimeSeriesData] File access verified. Status: ${logFile.uploadStatus}`);

      const whereClause: any = {
        logFileId: input.logFileId,
      };

      if (input.parameters && input.parameters.length > 0) {
        whereClause.parameter = {
          in: input.parameters,
        };
        console.log(`[getTimeSeriesData] Filtering by parameters: ${input.parameters.join(', ')}`);
      } else {
        console.log(`[getTimeSeriesData] No parameter filter - returning all data`);
      }

      const timeSeriesData = await ctx.db.timeSeriesPoint.findMany({
        where: whereClause,
        orderBy: [
          { parameter: "asc" },
          { timestamp: "asc" },
        ],
        take: input.limit,
        skip: input.offset,
      });

      console.log(`[getTimeSeriesData] Query returned ${timeSeriesData.length} records`);

      // Find the earliest timestamp to convert absolute timestamps to relative
      let earliestTimestamp = Infinity;
      timeSeriesData.forEach((point) => {
        if (point.timestamp < earliestTimestamp) {
          earliestTimestamp = point.timestamp;
        }
      });

      console.log(`[getTimeSeriesData] Earliest timestamp: ${earliestTimestamp}, converting to relative time`);

      // Group data by parameter for easier frontend consumption
      const groupedData: Record<string, Array<{
        timestamp: number;
        value: number;
        unit: string;
      }>> = {};

      timeSeriesData.forEach((point) => {
        if (!groupedData[point.parameter]) {
          groupedData[point.parameter] = [];
        }
        
        // Convert absolute timestamp to relative timestamp (starting from 0)
        const relativeTimestamp = point.timestamp - earliestTimestamp;
        
        groupedData[point.parameter]!.push({
          timestamp: relativeTimestamp,
          value: point.value,
          unit: point.unit,
        });
      });

      // Log sample of converted timestamps for debugging
      const sampleParam = Object.keys(groupedData)[0];
      if (sampleParam && groupedData[sampleParam]!.length > 0) {
        console.log(`[getTimeSeriesData] Sample converted timestamps for ${sampleParam}:`, 
          groupedData[sampleParam]!.slice(0, 3).map(p => p.timestamp));
      }

      return groupedData;
    }),

  // Get intelligent parameter metadata using AI analysis
  getParameterMetadata: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user owns the file
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
      });

      if (!logFile) {
        throw new Error("Log file not found or access denied");
      }

      // Get unique parameters with sample data for AI analysis
      const uniqueParams = await ctx.db.timeSeriesPoint.groupBy({
        by: ['parameter', 'unit'],
        where: {
          logFileId: input.logFileId,
        },
        _count: {
          parameter: true,
        },
        orderBy: {
          _count: {
            parameter: 'desc',
          },
        },
      });

      if (uniqueParams.length === 0) {
        return { categories: [], totalParameters: 0 };
      }

      // Get sample values for each parameter to help AI analysis
      const parametersWithSamples = await Promise.all(
        uniqueParams.map(async (param) => {
          const samples = await ctx.db.timeSeriesPoint.findMany({
            where: {
              logFileId: input.logFileId,
              parameter: param.parameter,
            },
            select: { value: true },
            take: 5, // Get 5 sample values for AI context
            orderBy: { timestamp: 'asc' },
          });

          return {
            parameter: param.parameter,
            unit: param.unit,
            count: param._count.parameter,
            sampleValues: samples.map(s => s.value),
          };
        })
      );

      try {
        // Use documentation-based analysis to enhance parameter metadata
        const enhancedMetadata = await ParameterIntelligenceService.analyzeParameters(
          parametersWithSamples.map(p => ({
            parameter: p.parameter,
            unit: p.unit,
            count: p.count,
            sampleValues: p.sampleValues,
          }))
        );

        return {
          categories: enhancedMetadata.categories,
          totalParameters: enhancedMetadata.totalParameters,
          documentationBased: enhancedMetadata.documentationBased,
        };

      } catch (error) {
        console.error('AI parameter analysis failed:', error);
        
        // Fallback to basic categorization
        const fallbackMetadata = parametersWithSamples.map(p => ({
          parameter: p.parameter,
          displayName: p.parameter.replace(/_/g, ' '),
          category: 'System_Health',
          description: `${p.parameter} telemetry data`,
          priority: 3,
          unit: p.unit,
          chartType: 'line' as 'line' | 'area' | 'bar' | 'scatter',
          colorHint: '#6b7280',
          isCore: false,
          count: p.count,
        }));

        return {
          categories: [{
            name: 'All_Parameters',
            displayName: 'All Parameters',
            description: 'Flight log telemetry parameters',
            icon: 'BarChart3',
            parameters: fallbackMetadata,
            priority: 1,
          }],
          totalParameters: uniqueParams.length,
          aiEnhanced: false,
        };
      }
    }),

  // Export data functionality
  exportData: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
        format: z.enum(["csv", "json", "png"]),
        parameters: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user owns the file
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
      });

      if (!logFile) {
        throw new Error("Log file not found or access denied");
      }

      const whereClause: any = {
        logFileId: input.logFileId,
      };

      if (input.parameters && input.parameters.length > 0) {
        whereClause.parameter = {
          in: input.parameters,
        };
      }

      const timeSeriesData = await ctx.db.timeSeriesPoint.findMany({
        where: whereClause,
        orderBy: [
          { timestamp: "asc" },
          { parameter: "asc" },
        ],
      });

      if (input.format === "csv") {
        // Generate CSV format
        const headers = ["timestamp", "parameter", "value", "unit"];
        const csvRows = [headers.join(",")];
        
        timeSeriesData.forEach((point) => {
          csvRows.push(`${point.timestamp},${point.parameter},${point.value},${point.unit}`);
        });

        return {
          format: "csv",
          data: csvRows.join("\n"),
          fileName: `${logFile.fileName}_export.csv`,
        };
      } else if (input.format === "json") {
        // Generate JSON format
        return {
          format: "json",
          data: JSON.stringify(timeSeriesData, null, 2),
          fileName: `${logFile.fileName}_export.json`,
        };
      } else if (input.format === "png") {
        // Generate PNG chart format
        if (!input.parameters || input.parameters.length === 0) {
          throw new Error("Parameters are required for PNG export");
        }

        try {
          let pngBuffer: Buffer;
          
          if (input.parameters.length === 1) {
            // Single parameter chart
            const parameter = input.parameters[0]!;
            const parameterData = timeSeriesData
              .filter(point => point.parameter === parameter)
              .map(point => ({
                timestamp: point.timestamp,
                value: point.value,
                unit: point.unit,
              }));

            if (parameterData.length === 0) {
              throw new Error(`No data found for parameter: ${parameter}`);
            }

            pngBuffer = await ChartRenderer.generatePngChart({
              title: `${logFile.fileName} - ${parameter}`,
              data: parameterData,
              parameter,
            });
          } else {
            // Multi-parameter chart
            const datasets = input.parameters.map(parameter => {
              const parameterData = timeSeriesData
                .filter(point => point.parameter === parameter)
                .map(point => ({
                  timestamp: point.timestamp,
                  value: point.value,
                  unit: point.unit,
                }));

              return {
                parameter,
                data: parameterData,
              };
            }).filter(dataset => dataset.data.length > 0);

            if (datasets.length === 0) {
              throw new Error("No data found for any of the specified parameters");
            }

            pngBuffer = await ChartRenderer.generateMultiParameterPngChart(
              `${logFile.fileName} - Multi-Parameter Chart`,
              datasets
            );
          }

          // Convert buffer to base64 for transmission
          const base64Data = pngBuffer.toString('base64');

          return {
            format: "png",
            data: `data:image/png;base64,${base64Data}`,
            fileName: `${logFile.fileName}_export.png`,
            mimeType: "image/png",
          };
        } catch (error) {
          console.error("PNG chart generation error:", error);
          throw new Error(`Failed to generate PNG chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }),

  // AI-related procedures for Story 1.3

  // Get AI insights preview (for upgrade prompts)
  getAiInsightsPreview: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user owns the file
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
      });

      if (!logFile) {
        throw new Error("Log file not found or access denied");
      }

      // Generate sample AI insights based on log file data
      const sampleInsights = [
        {
          id: "battery-optimization",
          title: "Battery optimization opportunity detected",
          description: `Flight pattern analysis suggests potential battery life extension through route optimization`,
          confidence: 0.87,
          category: "efficiency" as const,
          priority: "high" as const,
          applicableData: {
            batteryUsage: logFile.batteryStartVoltage && logFile.batteryEndVoltage 
              ? ((logFile.batteryStartVoltage - logFile.batteryEndVoltage) / logFile.batteryStartVoltage) * 100 
              : null,
            flightDuration: logFile.flightDuration,
          }
        },
        {
          id: "gps-analysis",
          title: "GPS signal quality pattern analysis",
          description: logFile.gpsQuality && logFile.gpsQuality < 85 
            ? "GPS quality variations detected - potential antenna positioning issue"
            : "Strong GPS signal quality maintained throughout flight",
          confidence: 0.74,
          category: "maintenance" as const,
          priority: logFile.gpsQuality && logFile.gpsQuality < 70 ? "high" as const : "medium" as const,
          applicableData: {
            gpsQuality: logFile.gpsQuality,
          }
        },
        {
          id: "flight-performance",
          title: "Flight performance analysis available",
          description: "Detailed analysis of flight modes, altitude management, and stability metrics",
          confidence: 0.92,
          category: "performance" as const,
          priority: "high" as const,
          applicableData: {
            maxAltitude: logFile.maxAltitude,
            totalDistance: logFile.totalDistance,
            flightModes: logFile.flightModes,
          }
        }
      ];

      return {
        logFileId: input.logFileId,
        fileName: logFile.fileName,
        insights: sampleInsights,
        previewGenerated: true,
      };
    }),

  // Generate limited AI preview (for "try" functionality)
  generateAiPreview: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the file
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
      });

      if (!logFile) {
        throw new Error("Log file not found or access denied");
      }

      // Check if user has already used their preview
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (user?.aiPreviewUsed) {
        throw new Error("AI preview already used. Upgrade to Pro for unlimited access.");
      }

      // Create a limited AI analysis result
      const previewAnalysis = {
        type: "preview",
        insights: [
          {
            category: "performance",
            title: "Flight Duration Analysis",
            description: logFile.flightDuration 
              ? `Flight duration of ${Math.round(logFile.flightDuration / 60)} minutes is ${logFile.flightDuration > 900 ? 'above' : 'within'} typical range`
              : "Flight duration data not available",
            confidence: 0.85,
            recommendations: ["Consider flight planning optimization for longer missions"]
          }
        ],
        limitations: [
          "This is a limited preview - full analysis available with Pro subscription",
          "Preview includes basic performance metrics only",
          "Advanced safety and maintenance insights require upgrade"
        ]
      };

      // Mark user as having used their preview
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { aiPreviewUsed: true },
      });

      // Create analysis result record
      const analysisResult = await ctx.db.analysisResult.create({
        data: {
          logFileId: input.logFileId,
          userId: ctx.session.user.id,
          analysisType: "preview",
          insights: previewAnalysis.insights,
          confidenceScore: 0.85,
          methodology: {
            steps: [
              "Basic data validation",
              "Performance metrics calculation",
              "Limited pattern recognition"
            ]
          }
        },
      });

      return {
        success: true,
        analysisId: analysisResult.id,
        preview: previewAnalysis,
        message: "Limited AI preview generated successfully"
      };
    }),

  // Get user AI preferences
  getUserAiPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          aiPromptsEnabled: true,
          aiPromptFrequency: true,
          aiPreviewUsed: true,
          lastAiPrompt: true,
          subscriptionTier: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),

  // Update AI preferences
  updateAiPreferences: protectedProcedure
    .input(
      z.object({
        aiPromptsEnabled: z.boolean().optional(),
        aiPromptFrequency: z.enum(["low", "normal", "high"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...input,
          lastAiPrompt: new Date(), // Update last prompt time
        },
      });

      return {
        success: true,
        preferences: {
          aiPromptsEnabled: updatedUser.aiPromptsEnabled,
          aiPromptFrequency: updatedUser.aiPromptFrequency,
        },
      };
    }),

  // Track AI upgrade events (for analytics)
  trackAiUpgradeEvent: protectedProcedure
    .input(
      z.object({
        event: z.enum(["preview_clicked", "upgrade_clicked", "modal_opened", "modal_closed", "trial_started"]),
        metadata: z.record(z.any()).optional(),
        logFileId: z.string().cuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would send to analytics service
      // For now, we'll just log it and potentially store in database
      
      const eventData = {
        userId: ctx.session.user.id,
        event: input.event,
        metadata: input.metadata,
        logFileId: input.logFileId,
        timestamp: new Date(),
      };

      // TODO: Integrate with analytics service (e.g., Mixpanel, PostHog)
      console.log("AI Upgrade Event Tracked:", eventData);

      return {
        success: true,
        tracked: true,
      };
    }),

  // Get raw parsed data from log file for debugging/inspection
  getRawParsedData: protectedProcedure
    .input(
      z.object({
        logFileId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get log file info
      const logFile = await ctx.db.logFile.findFirst({
        where: {
          id: input.logFileId,
          userId: ctx.session.user.id,
        },
      });

      if (!logFile) {
        throw new Error("Log file not found or access denied");
      }

      if (logFile.uploadStatus !== "PROCESSED") {
        throw new Error("Log file has not been processed yet");
      }

      // Download file from Supabase Storage
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const filePath = `log-files/${logFile.userId}/${logFile.id}/${logFile.fileName}`;
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('log-files')
        .download(filePath);

      if (downloadError) {
        console.error(`Supabase download error:`, downloadError);
        throw new Error(`Failed to download file from storage: ${downloadError.message}`);
      }

      if (!fileData) {
        throw new Error("No file data received from storage");
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      
      try {
        const rawMessages = LogParser.parseLogFileRawFromBuffer(buffer);
        
        // Group messages by type and provide samples
        const messageGroups = Object.entries(rawMessages).map(([messageType, messages]) => {
          const sortedMessages = messages.sort((a, b) => b.timestamp - a.timestamp);
          const samples = sortedMessages.slice(0, 5); // Show latest 5 samples
          const fields = messages.length > 0 ? Object.keys(messages[0]?.data || {}) : [];
          
          return {
            messageType,
            count: messages.length,
            samples: samples.map(msg => ({
              timestamp: msg.timestamp,
              data: msg.data
            })),
            fields
          };
        });

        return messageGroups.sort((a, b) => b.count - a.count); // Sort by message count descending
      } catch (error) {
        console.error("Failed to parse raw log data:", error);
        throw new Error("Failed to parse log file for raw data");
      }
    }),
});