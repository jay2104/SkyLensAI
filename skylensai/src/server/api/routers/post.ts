import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Note: Post model removed, replaced with SkyLensAI models (LogFile, AnalysisResult)
  // These endpoints are disabled until LogFile functionality is implemented in future stories
  
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Replace with LogFile creation in future stories
      return { message: "LogFile creation will be implemented in Story 1.1" };
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Replace with latest LogFile query in future stories  
    return null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
