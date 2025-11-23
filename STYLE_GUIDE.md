# 🎨 Church Volunteer Connect - Style Guide

## 📋 Table of Contents

1. [🔧 Development Environment Setup](#development-environment-setup)
2. [📝 Code Style & Formatting](#code-style--formatting)
3. [🏗️ Component Architecture](#component-architecture)
4. [🎯 TypeScript Best Practices](#typescript-best-practices)
5. [🎨 CSS & Tailwind Guidelines](#css--tailwind-guidelines)
6. [📁 File & Directory Naming](#file--directory-naming)
7. [🔒 Security & Best Practices](#security--best-practices)
8. [🧪 Testing Guidelines](#testing-guidelines)
9. [📊 Performance Guidelines](#performance-guidelines)
10. [📚 Documentation Standards](#documentation-standards)

---

## 🔧 Development Environment Setup

### Required Tools
- **Package Manager**: Bun (required)
- **IDE**: VS Code with recommended extensions
- **Node.js**: Version 18+ (Bun includes compatible Node)
- **Git**: Latest version with hooks configured

### VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
bun install

# Setup database
bunx prisma db push
bunx prisma generate

# Seed demo data
bunx tsx prisma/seed.ts
```

---

## 📝 Code Style & Formatting

### Formatting Rules
- **Tool**: Prettier (configured in `.prettierrc`)
- **Line Width**: 100 characters
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Required
- **Quotes**: Single quotes for strings, double quotes for JSX

### ESLint Configuration
```javascript
module.exports = {
  extends: [
    '@next/eslint-config-next',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // Custom rules for this project
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn', // Allow in development
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

### Code Organization
```typescript
// ✅ GOOD: Proper import organization
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// ❌ BAD: Mixed import styles
import NextRequest from 'next/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
```

---

## 🏗️ Component Architecture

### Component Structure Template
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ComponentProps {
  // Props interface
}

export default function ComponentName({ prop }: ComponentProps) {
  // Hooks first
  const { data: session } = useSession();
  const router = useRouter();
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleAction = async () => {
    // Handler logic
  };

  // Conditional renders
  if (!session) return <div>Please sign in</div>;

  // Main JSX return
  return (
    <div className="tailwind-classes">
      {/* Component content */}
    </div>
  );
}
```

### Component Best Practices

#### Single Responsibility
- Each component should have one clear purpose
- Extract complex logic into custom hooks
- Keep components under 200 lines when possible

#### Props Interface
```typescript
// ✅ GOOD: Descriptive prop names
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  showActions?: boolean;
  className?: string;
}

// ❌ BAD: Generic prop names
interface Props {
  data: any;
  callback: Function;
  flag?: boolean;
}
```

#### State Management
```typescript
// ✅ GOOD: Specific state types
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ❌ BAD: Generic state
const [data, setData] = useState();
const [isLoading, setIsLoading] = useState();
```

---

## 🎯 TypeScript Best Practices

### Type Definitions
```typescript
// ✅ GOOD: Specific interfaces
interface User {
  id: string;
  email: string;
  name: string;
  role: 'VOLUNTEER' | 'LEADER';
  profile?: UserProfile;
}

// ❌ BAD: Using 'any'
interface User {
  id: any;
  data: any;
  [key: string]: any;
}
```

### Generic Types
```typescript
// ✅ GOOD: Proper generics
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // Implementation
}

// ❌ BAD: Unclear generics
function fetchSomething(url: string): Promise<any> {
  // Implementation
}
```

### Error Handling
```typescript
// ✅ GOOD: Specific error types
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
  }
}

// ✅ GOOD: Result pattern
type Result<T, E = Error> = {
  success: boolean;
  data?: T;
  error?: E;
};

function validateUser(data: unknown): Result<User, ValidationError> {
  // Validation logic
}
```

---

## 🎨 CSS & Tailwind Guidelines

### Class Organization
```typescript
// ✅ GOOD: Group related classes
<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Content
  </h2>
</div>

// ❌ BAD: Scattered classes
<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Content
  </h2>
</div>
```

### Responsive Design
```typescript
// ✅ GOOD: Responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="text-sm md:text-base lg:text-lg">
    Content
  </div>
</div>

// ❌ BAD: No responsive design
<div className="grid grid-cols-4 gap-6">
  <div className="text-lg">
    Content
  </div>
</div>
```

### Component Variants
```typescript
// ✅ GOOD: Consistent variant patterns
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

<button className={buttonVariants[variant]}>
  {children}
</button>
```

---

## 📁 File & Directory Naming

### File Naming
```typescript
// ✅ GOOD: Consistent naming
components/UserCard.tsx          // React component
hooks/useUserData.ts            // Custom hook
utils/validationHelpers.ts        // Utility functions
types/user.types.ts             // Type definitions
lib/api-client.ts              // Library module

// ❌ BAD: Inconsistent naming
components/usercard.tsx
hooks/userData.ts
utils/ValidationHelpers.ts
types/UserTypes.ts
lib/ApiClient.ts
```

### Directory Structure
```
src/
├── app/                    # Next.js pages
├── components/             # Shared React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── types/                  # TypeScript definitions
├── utils/                  # Helper functions
└── styles/                 # Global styles
```

---

## 🔒 Security & Best Practices

### Input Validation
```typescript
// ✅ GOOD: Comprehensive validation
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// ❌ BAD: No validation
const userData = JSON.parse(request.body);
```

### Environment Variables
```typescript
// ✅ GOOD: Secure environment handling
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}

// ❌ BAD: Exposing sensitive data
const dbUrl = process.env.DATABASE_URL || 'fallback';
console.log('Database URL:', dbUrl); // Security risk
```

### Authentication
```typescript
// ✅ GOOD: Secure session handling
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// ❌ BAD: Insecure authentication
const session = req.cookies.session;
if (session) {
  // Trust user input without validation
}
```

---

## 🧪 Testing Guidelines

### Test Structure
```typescript
// ✅ GOOD: Organized test file
describe('User Management', () => {
  describe('User Creation', () => {
    it('should create user with valid data', async () => {
      // Test implementation
    });

    it('should reject invalid email', async () => {
      // Test implementation
    });
  });

  describe('User Authentication', () => {
    // Authentication tests
  });
});
```

### Test Data Management
```typescript
// ✅ GOOD: Using test data factory
import { testDataFactory } from '@/test-data/factory';

describe('User API', () => {
  it('should handle user creation', async () => {
    const userData = testDataFactory.user('volunteer');
    // Test with generated data
  });
});
```

### Mock Management
```typescript
// ✅ GOOD: Proper mocking
import { vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn().mockResolvedValue(mockUser),
    },
  },
}));

// Clean up mocks
afterEach(() => {
  vi.clearAllMocks();
});
```

---

## 📊 Performance Guidelines

### React Performance
```typescript
// ✅ GOOD: Optimized components
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);

  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return <div>{/* Component content */}</div>;
});
```

### API Performance
```typescript
// ✅ GOOD: Efficient database queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    // Only select required fields
  },
  where: {
    active: true,
  },
  take: 50, // Pagination
});
```

### Bundle Optimization
```typescript
// ✅ GOOD: Dynamic imports
const loadHeavyComponent = () => import('./HeavyComponent');

// Use in component
const LazyComponent = dynamic(() => import('./LazyComponent'));
```

---

## 📚 Documentation Standards

### Code Comments
```typescript
// ✅ GOOD: Clear, concise comments
/**
 * Validates user input data
 * @param data - User input to validate
 * @returns Validation result with error details
 */
function validateUser(data: UserInput): ValidationResult {
  // Check email format
  if (!isValidEmail(data.email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}

// ❌ BAD: Unnecessary comments
function validateUser(data) {
  // Get email
  const email = data.email;
  // Check if valid
  if (isValidEmail(email)) {
    return { valid: true };
  }
}
```

### Function Documentation
```typescript
// ✅ GOOD: JSDoc comments
/**
 * Creates a new user in the database
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   password: 'securePassword123'
 * });
 * ```
 */
export async function createUser(userData: CreateUserInput): Promise<User> {
  // Implementation
}
```

---

## 🚀 Development Workflow

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/user-authentication
# Make changes
git add .
git commit -m "feat: add user authentication"
git push origin feature/user-authentication
# Create pull request
```

### Code Review Checklist
- [ ] Code follows style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] TypeScript types are correct
- [ ] Environment variables are handled

### Pre-commit Validation
```bash
# Automatically runs before each commit:
- ESLint checking
- Prettier formatting
- TypeScript type checking
- Unit tests execution
```

---

## 🎯 Quick Reference

### Common Patterns
```typescript
// API Route Pattern
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validation and processing
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Custom Hook Pattern
export function useApiData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetch(url);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

### Error Handling Patterns
```typescript
// Result Pattern
type Result<T, E = Error> = {
  success: boolean;
  data?: T;
  error?: E;
};

// Async Error Handling
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', error);
  return { success: false, error };
}
```

---

*Last Updated: November 23, 2024*
