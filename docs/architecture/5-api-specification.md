# **5. API Specification**

## **tRPC Router Definitions**

Our API will be organized into logical "routers." The code itself defines the endpoints, their inputs, and their outputs, which are shared automatically with the frontend, ensuring end-to-end type safety.

```typescript
// Located in our backend package (e.g., /apps/api/src/routers/index.ts)

import { userRouter } from './user';
import { logFileRouter } from './logFile';
import { analysisRouter } from './analysis';
import { createTRPCRouter } from '../trpc';

// The main application router that combines all other routers
export const appRouter = createTRPCRouter({
  user: userRouter,
  logFile: logFileRouter,
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;

// --- Example Router for Log Files ---
export const logFileRouter = createTRPCRouter({
  // Procedure to get a secure URL to upload a file to
  getPresignedUploadUrl: protectedProcedure
    .input(z.object({ fileName: z.string(), fileType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ... logic to generate a secure upload URL from Supabase Storage
      // Returns { uploadUrl: "...", logFileId: "..." }
    }),

  // Procedure to tell the backend the upload is complete
  confirmUpload: protectedProcedure
    .input(z.object({ logFileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ... logic to mark the log file as "UPLOADED" and trigger analysis
    }),
});
```
