# Coding Standards: SkyLensAI

## Overview

These coding standards ensure consistency, maintainability, and AI agent compatibility across the SkyLensAI codebase. All development must adhere to these standards to maintain code quality and enable effective AI-driven development.

## 1. TypeScript Standards

### 1.1 Type Safety
- **Strict Mode Required**: All TypeScript files must compile with `strict: true`
- **Explicit Typing**: Avoid `any` type - use specific types or `unknown` when appropriate
- **Interface over Type**: Prefer `interface` for object shapes, `type` for unions/intersections
- **Generic Constraints**: Use generic constraints to improve type safety

```typescript
// ✅ Good
interface LogFileProps {
  fileName: string;
  fileSize: number;
  uploadStatus: 'PENDING' | 'UPLOADED' | 'PROCESSED' | 'ERROR';
}

// ❌ Avoid
const data: any = getLogFile();
```

### 1.2 Naming Conventions
- **Files**: Use kebab-case for files (`file-upload.tsx`, `text-input.component.tsx`)
- **Components**: Use PascalCase (`FileUpload`, `TextInput`, `InputSelector`)
- **Variables/Functions**: Use camelCase (`uploadFile`, `validateInput`, `currentStatus`)
- **Constants**: Use SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`, `ACCEPTED_FORMATS`)
- **Types/Interfaces**: Use PascalCase with descriptive suffixes (`LogFileType`, `UploadStatusEnum`)

## 2. React/Next.js Standards

### 2.1 Component Structure
- **Functional Components**: Use function declarations with TypeScript interfaces
- **Props Interface**: Always define props interface above component
- **Default Exports**: Use default exports for page components, named exports for utilities

```typescript
// ✅ Component Template
interface FileUploadProps {
  onUpload: (file: File) => void;
  maxSize: number;
  acceptedFormats: string[];
}

export default function FileUpload({ onUpload, maxSize, acceptedFormats }: FileUploadProps) {
  // Component implementation
}
```

### 2.2 Hooks Usage
- **Custom Hooks**: Prefix with `use` and extract reusable logic
- **State Management**: Use `useState` for local state, Zustand for global state
- **Effect Dependencies**: Always include all dependencies in useEffect arrays

### 2.3 Error Boundaries
- **Error Handling**: Wrap components that might fail in error boundaries
- **User Feedback**: Provide meaningful error messages to users
- **Logging**: Log errors for debugging while avoiding sensitive data exposure

## 3. File Organization

### 3.1 Directory Structure (Current Project)
```
skylensai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Route groups
│   │   ├── api/                # API routes
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── forms/              # Form-specific components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Utility functions and configurations
│   │   ├── utils.ts            # General utilities
│   │   ├── validations.ts      # Zod schemas
│   │   └── constants.ts        # Application constants
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # CSS modules and Tailwind extensions
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets
└── tests/                      # Test files
```

### 3.2 Import Organization
```typescript
// ✅ Import Order
// 1. React/Next.js imports
import React from 'react';
import { NextPage } from 'next';

// 2. Third-party libraries
import { z } from 'zod';
import { Button } from '@/components/ui/button';

// 3. Internal utilities and types
import { cn } from '@/lib/utils';
import type { LogFileType } from '@/types/log-file';

// 4. Relative imports
import './component.css';
```

## 4. API & Database Standards

### 4.1 tRPC Procedures
- **Input Validation**: Use Zod schemas for all inputs
- **Error Handling**: Use tRPC error codes appropriately
- **Return Types**: Define explicit return types for procedures

```typescript
// ✅ tRPC Procedure Template
export const logFileRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.enum(['BIN', 'LOG', 'TLOG', 'ULG']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Implementation with proper error handling
    }),
});
```

### 4.2 Database Operations
- **Prisma Best Practices**: Use transactions for multi-step operations
- **Error Handling**: Handle database errors gracefully
- **Type Safety**: Leverage Prisma's generated types

## 5. Testing Standards

### 5.1 Test Structure
- **File Naming**: Use `.test.tsx` for component tests, `.test.ts` for utilities
- **Test Organization**: Group tests by component/feature
- **Describe Blocks**: Use descriptive test groupings

```typescript
// ✅ Test Template
describe('FileUpload Component', () => {
  describe('File Validation', () => {
    it('should accept valid file formats', () => {
      // Test implementation
    });

    it('should reject files exceeding size limit', () => {
      // Test implementation
    });
  });
});
```

### 5.2 Testing Patterns
- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test component interactions and API calls
- **E2E Tests**: Test complete user workflows with Playwright
- **Coverage**: Maintain minimum 80% test coverage for new code

## 6. Styling Standards

### 6.1 Tailwind CSS Usage
- **Utility Classes**: Prefer Tailwind utilities over custom CSS
- **Component Variants**: Use cva (class-variance-authority) for component variants
- **Responsive Design**: Mobile-first approach with responsive utilities

```typescript
// ✅ Component with Tailwind
export function FileUpload({ className, ...props }: FileUploadProps) {
  return (
    <div className={cn(
      "border-2 border-dashed border-gray-300 rounded-lg p-6",
      "hover:border-gray-400 transition-colors",
      "focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200",
      className
    )}>
      {/* Component content */}
    </div>
  );
}
```

### 6.2 Shadcn/UI Integration
- **Component Customization**: Extend Shadcn/UI components rather than replacing
- **Theme Consistency**: Use CSS variables for consistent theming
- **Accessibility**: Ensure all custom components maintain accessibility standards

## 7. Security Standards

### 7.1 Input Validation
- **Server-Side Validation**: Always validate inputs on the server
- **Sanitization**: Sanitize user inputs to prevent XSS
- **File Upload Security**: Validate file types and sizes on both client and server

### 7.2 Authentication & Authorization
- **Session Management**: Use NextAuth.js patterns for session handling
- **Route Protection**: Protect API routes and pages appropriately
- **Data Access**: Ensure users can only access their own data

## 8. Performance Standards

### 8.1 Code Splitting
- **Dynamic Imports**: Use dynamic imports for large components
- **Route-Based Splitting**: Leverage Next.js automatic code splitting
- **Bundle Analysis**: Regular bundle size monitoring

### 8.2 Optimization Patterns
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Image Optimization**: Use Next.js Image component for all images
- **Database Queries**: Optimize Prisma queries and use appropriate indexes

## 9. Documentation Standards

### 9.1 Code Documentation
- **JSDoc Comments**: Document public APIs and complex functions
- **README Files**: Maintain README files for significant modules
- **Type Documentation**: Use TypeScript types as documentation

### 9.2 Commit Messages
- **Conventional Commits**: Use conventional commit format
- **Scope**: Include scope when applicable (feat(upload): add file validation)
- **Description**: Write clear, concise commit descriptions

## 10. AI Agent Compatibility

### 10.1 Code Clarity
- **Explicit Over Implicit**: Write code that's easy for AI agents to understand
- **Consistent Patterns**: Follow established patterns throughout the codebase
- **Minimal Abstraction**: Avoid overly clever abstractions that confuse AI agents

### 10.2 Error Prevention
- **Type Safety**: Leverage TypeScript to prevent runtime errors
- **Validation**: Add runtime validation where TypeScript types aren't sufficient
- **Testing**: Comprehensive tests help AI agents understand expected behavior

---

## Enforcement

These standards are enforced through:
- **ESLint Configuration**: Automated linting with custom rules
- **Prettier**: Consistent code formatting
- **Husky Git Hooks**: Pre-commit validation
- **Code Reviews**: Manual review process for adherence
- **CI/CD Pipeline**: Automated testing and validation

## Updates

This document should be updated whenever new patterns emerge or standards change. All updates must be reviewed by the development team and reflected in the tooling configuration.

---

*Last Updated: 2025-07-28*
*Version: 1.0*
*Author: Winston (Architect)*