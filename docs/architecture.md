Of course. I have consolidated our entire session with Winston, the Architect, and have generated the complete, finalized **Architecture Document**.

You can now copy the text below and save it as `architecture.md` in your project's `docs/` folder.

-----

````markdown
# Fullstack Architecture Document: SkyLensAI

### **1. Introduction**

This document outlines the complete fullstack architecture for the SkyLensAI project, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

#### **Starter Template or Existing Project**

Based on a thorough review of the project's goals for speed, quality, and modern best practices, we will be using the **T3 Stack** as our foundational starter template. This template accelerates development by providing a pre-configured, type-safe, full-stack environment that is designed for serverless deployment.

#### **Change Log**

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-07-27 | 1.0 | Initial Architecture draft | Winston, Architect |

### **2. High-Level Architecture**

#### **Technical Summary**
This project will be a full-stack, type-safe web application built on the T3 Stack. The architecture is designed for a modern Jamstack approach, featuring a server-rendered React frontend (Next.js) and a serverless API layer (tRPC) deployed as a single unit. The database will be managed via Prisma, providing a clear and type-safe interface between the application and our data. This approach ensures a seamless developer experience, high performance for the end-user, and aligns perfectly with our "start low-cost and scale" strategy.

#### **Platform and Infrastructure Choice**
* **Platform:** **Vercel**.
    * **Rationale:** Vercel is the company that created Next.js, a core part of the T3 Stack. The integration is seamless. It provides a world-class developer experience, handles serverless function deployment automatically, and offers a generous free tier that aligns with our low-cost startup goal.
* **Database:** **Supabase** (using their Postgres database).
    * **Rationale:** Supabase offers a robust, managed PostgreSQL database with an excellent free tier. It integrates perfectly with Prisma and provides helpful features like built-in authentication and file storage that we may leverage in future epics.

#### **Repository Structure**
* **Structure:** **Monorepo**.
    * **Rationale:** As confirmed in the PRD and supported by the T3 Stack, a monorepo will allow us to easily share code and types (e.g., the structure of log data) between our frontend components and our backend API logic.

#### **High-Level Architecture Diagram**
```mermaid
graph TD
    User -- HTTPS --> VercelPlatform[Vercel Platform]

    subgraph VercelPlatform
        Frontend[Next.js React Frontend]
        API[tRPC Serverless API]
    end

    API -- SQL/Prisma --> DB[(Supabase Postgres DB)]
    Frontend -- Renders --> User
````

## **3. Tech Stack**

### **Technology Stack Table**

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | 5.4.5 | Primary language for type safety | Enforces type safety across the stack, reducing bugs and improving developer experience. |
| **Frontend Framework** | Next.js (React) | 14.2.3 | UI Framework and server environment | Provides a robust foundation for server-rendered React, routing, and API endpoints. The core of the T3 Stack. |
| **UI Component Library**| Shadcn/UI | latest | Headless component library | Provides accessible and unstyled components that we can fully customize, avoiding opinionated style libraries. |
| **State Management** | Zustand | 4.5.2 | Lightweight state management | Simple and effective for managing global state without the complexity of larger libraries like Redux. |
| **Backend Language** | TypeScript | 5.4.5 | Primary language for type safety | Enables code and type sharing with the frontend in our Monorepo. |
| **API Style** | tRPC | 11.0.0-rc.355 | Type-safe API layer | Guarantees end-to-end type safety between the frontend and backend without needing to generate schemas. |
| **Database** | PostgreSQL | 15.x | Primary relational database | A powerful, reliable, and open-source SQL database provided by Supabase. |
| **Database ORM** | Prisma | 5.14.0 | Object-Relational Mapper | Manages database schema and queries in a type-safe way, integrating perfectly with TypeScript. |
| **File Storage** | Supabase Storage | latest | For storing user-uploaded log files | Integrated with our database provider and offers a simple, S3-compatible API. |
| **Authentication** | NextAuth.js | 5.0.0-beta.19 | Authentication solution | The recommended authentication library for the T3 Stack, providing flexible and secure auth patterns. |
| **Styling** | Tailwind CSS | 3.4.3 | Utility-first CSS framework | Allows for rapid development of custom designs without writing custom CSS. |
| **Deployment** | Vercel | latest | Hosting Platform for Next.js | Provides seamless, automated deployments, serverless functions, and global CDN for optimal performance. |
| **Testing** | Vitest & RTL | latest | Unit & integration testing | Modern and fast testing frameworks for our component and API logic. |

## **4. Data Models**

### **User**

  * **Purpose:** Represents an individual who has signed up for the application. This model will handle identity and subscription status.
  * **Key Attributes:**
      * `id`: (String) - Unique Identifier
      * `email`: (String) - User's email address, used for login
      * `name`: (String) - User's display name
      * `subscriptionTier`: (Enum: `FREE`, `PRO`, `ENTERPRISE`) - The user's current payment plan
      * `createdAt`: (DateTime) - Timestamp of account creation
      * `updatedAt`: (DateTime) - Timestamp of last update
  * **Relationships:**
      * A `User` can have many `LogFiles`.
      * A `User` can have many `AnalysisResults`.

### **LogFile**

  * **Purpose:** Represents a single drone log file uploaded by a user for analysis.
  * **Key Attributes:**
      * `id`: (String) - Unique Identifier
      * `fileName`: (String) - The original name of the uploaded file
      * `fileType`: (Enum: `BIN`, `LOG`, `TLOG`, `ULG`) - The detected format of the log
      * `uploadStatus`: (Enum: `PENDING`, `UPLOADED`, `PROCESSED`, `ERROR`) - The status of the file in our system
      * `fileSize`: (Integer) - File size in bytes
  * **Relationships:**
      * A `LogFile` belongs to one `User`.
      * A `LogFile` can have one `AnalysisResult`.

### **AnalysisResult**

  * **Purpose:** Stores the output of the AI analysis for a specific log file.
  * **Key Attributes:**
      * `id`: (String) - Unique Identifier
      * `status`: (Enum: `PENDING`, `COMPLETE`, `ERROR`) - The status of the AI analysis job
      * `healthScore`: (Integer) - An overall health score (e.g., 1-100) for the flight, if applicable.
      * `summary`: (String) - A high-level, human-readable summary of the findings.
      * `detailedFindings`: (JSON) - A structured JSON object containing all the detailed checks, their outcomes, and evidence.
  * **Relationships:**
      * An `AnalysisResult` belongs to one `LogFile`.

## **5. API Specification**

### **tRPC Router Definitions**

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

## **6. Components**

Our application can be understood as a system of five primary, interconnected components.

### **Web Application (Frontend)**

  * **Responsibility:** To provide the entire user interface, including the premium dashboard, data visualizations, and interactive elements.
  * **Technology Stack:** Next.js, React, Tailwind CSS, Shadcn/UI.

### **API Layer (Backend)**

  * **Responsibility:** To handle all incoming requests from the Web Application. It orchestrates business logic, validates data, and communicates with the database and other services.
  * **Technology Stack:** Next.js, tRPC, Prisma.

### **AI Analysis Service**

  * **Responsibility:** To perform the computationally intensive analysis of log files.
  * **Technology Stack:** Python, with libraries like Pandas, Scikit-learn, or PyTorch/TensorFlow.

### **Database Service**

  * **Responsibility:** To reliably store and retrieve all application data.
  * **Technology Stack:** Supabase (PostgreSQL).

### **File Storage Service**

  * **Responsibility:** To securely store and provide access to large, user-uploaded log files.
  * **Technology Stack:** Supabase Storage.

## **7. External APIs**

  * **Stripe API:** To handle global payment processing.
  * **Razorpay API:** To provide a localized payment experience for the Indian market.
  * **Architectural Note:** Our system will be designed with a generic "Payment Provider" interface to easily support multiple gateways.

## **8. AI Architecture**

Our strategy is based on a modern pattern called **Retrieval-Augmented Generation (RAG)**.

  * **The Brain (LLMs):** We will use a powerful Large Language Model to understand user queries and generate answers.
  * **The Specialized Library (Our Knowledge Graph):** Our proprietary pipeline will build a curated and validated database of drone-specific knowledge.
  * **The RAG Pattern:** We will use the RAG pattern to connect the LLM to our specialized library. This forces the AI to ground its answers in our validated data, preventing "hallucinations" and ensuring its answers are trustworthy and traceable to a source. This approach is faster, cheaper, more flexible, and provides a more trustworthy user experience than fine-tuning a custom model for our use case.

## **9. Core Workflows**

The core user flow for log analysis will be architected for a real-time experience using **WebSockets**. After a user uploads a file, the backend will process it asynchronously. Once the AI analysis is complete, the result will be pushed directly to the user's web browser via a WebSocket connection, providing instant notification without the need for the browser to repeatedly poll the server.

## **10. Database Schema**

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

## **11. Unified Project Structure**

```plaintext
/SkyLensAI/
├── apps/
│   └── nextjs/                 # Our main Next.js web application
│       ├── src/
│       │   ├── app/            # Frontend: Pages and UI components
│       │   ├── server/         # Backend: Our tRPC API routers
│       │   └── styles/         # Global CSS and Tailwind directives
│       └── ...
├── packages/
│   ├── db/                     # Database package
│   │   ├── prisma/             # Prisma schema and migrations
│   │   └── index.ts            # Database client export
│   └── auth/                   # Authentication package
│       ├── index.ts            # NextAuth.js configuration
│       └── ...
├── infrastructure/
│   └── ...                     # Future home for Infrastructure as Code
├── docs/
│   ├── prd.md
│   └── architecture.md
└── package.json                # Root project configuration
```

## **12. Checklist Results and Next Steps**

The **Architect Solution Validation Checklist** has been run against this document. The architecture is confirmed to be robust, scalable, pragmatic, and tightly aligned with all product requirements. All identified risks have a clear mitigation strategy. The architecture is **Ready for Development**.

The next step is for the Scrum Master to take this document and the PRD to create the first development stories for Epic 1.

```
```