# **3. Tech Stack**

## **Technology Stack Table**

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
