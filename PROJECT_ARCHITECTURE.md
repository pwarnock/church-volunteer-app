# 🏗️ Project Architecture & Development Guide

## 📋 Table of Contents

1. [🎯 Project Overview](#-project-overview)
2. [📁 Directory Structure](#-directory-structure)
3. [🔧 Development Workflow](#-development-workflow)
4. [📊 Testing Strategy](#-testing-strategy)
5. [🎨 Code Style Guide](#-code-style-guide)
6. [🚀 Deployment Guide](#-deployment-guide)
7. [📈 Performance & Monitoring](#-performance--monitoring)
8. [🔒 Security Best Practices](#-security-best-practices)

---

## 🎯 Project Overview

**Church Volunteer Connect** is a modern web application that connects church volunteers with meaningful ministry opportunities through spiritual gifts assessment and personalized matching.

### Core Features
- **Role-based Authentication**: Volunteers and Ministry Leaders
- **Spiritual Gifts Assessment**: 5-step interactive assessment with biblical context
- **Opportunity Management**: Browse, filter, and apply for ministry opportunities
- **Application Management**: Leaders can review and manage volunteer applications
- **Profile Management**: Skills, interests, and availability tracking
- **Data-Driven Testing**: Comprehensive test framework with metrics collection

### Tech Stack
- **Runtime**: Bun (primary) / Node.js 18+ (fallback)
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with JWT strategy
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma
- **Testing**: Vitest (unit), Playwright (E2E), Cucumber (BDD)
- **Deployment**: Vercel

---

## 📁 Directory Structure

```
church-volunteer-app/
├── 📁 src/                          # Source code
│   ├── 📁 app/                     # Next.js App Router pages
│   │   ├── 📁 api/                 # API routes
│   │   ├── 📁 auth/                # Authentication pages
│   │   ├── 📁 dashboard/            # Main dashboard
│   │   ├── 📁 leader/               # Leader-specific pages
│   │   │   ├── 📁 components/       # Leader UI components
│   │   ├── 📁 hooks/             # Leader data hooks
│   │   └── 📁 types/             # Leader TypeScript types
│   │   └── 📁 volunteer/           # Volunteer-specific pages
│   │       ├── 📁 assessment/       # Assessment pages
│   │       └── 📁 opportunities/    # Opportunity browsing
│   ├── 📁 components/              # Shared React components
│   ├── 📁 data/                   # Static data
│   │   └── 📁 spiritualGifts/     # Spiritual gifts data
│   ├── 📁 lib/                    # Utility libraries
│   │   ├── 📁 metrics/             # Metrics collection
│   │   └── 📁 test-metrics/        # Test analytics
│   └── 📁 test-data/               # Test data management
│       ├── storage.ts               # Test data persistence
│       ├── factory.ts                # Test data generation
│       └── applications.ts           # Application test data
├── 📁 scripts/                     # Build and utility scripts
├── 📁 __tests__/                    # Global test files
├── 📁 e2e/                        # Playwright E2E tests
├── 📁 features/                    # Cucumber BDD features
├── 📁 prisma/                     # Database schema and migrations
└── 📁 public/                     # Static assets
```

---

## 🔧 Development Workflow

### Priority 1: Environment Setup
```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Initialize database
bunx prisma db push
bunx prisma generate

# Seed demo data
bunx tsx prisma/seed.ts
```

### Priority 2: Development Server
```bash
# Start development server
bun run dev
# Access at http://localhost:3000
```

### Priority 3: Code Quality
```bash
# Lint and format code
bun run lint:fix
bun run format

# Type checking
bunx tsc --noEmit
```

### Priority 4: Testing
```bash
# Run unit tests
bun test

# Run E2E tests
bun test:e2e

# Run BDD tests
bun test:bdd

# Test coverage
bun test:coverage
```

---

## 📊 Testing Strategy

### Testing Pyramid

1. **Unit Tests (70%)** - Fast, isolated component and function tests
2. **Integration Tests (20%)** - API route and database interaction tests
3. **E2E Tests (10%)** - Complete user workflow tests

### Test Types

#### Unit Tests (Vitest)
- **Location**: `src/**/*.test.ts`
- **Focus**: Components, hooks, utilities
- **Command**: `bun test`

#### E2E Tests (Playwright)
- **Location**: `e2e/**/*.spec.ts`
- **Focus**: Complete user workflows
- **Command**: `bun test:e2e`

#### BDD Tests (Cucumber)
- **Location**: `features/**/*.feature`
- **Focus**: Business requirements validation
- **Command**: `bun test:bdd`

### Data-Driven Testing

#### Test Data Factory
```typescript
import { testDataFactory } from '@/test-data/factory';

// Generate test data
const user = testDataFactory.user('volunteer');
const opportunity = testDataFactory.opportunity('active');
```

#### Test Data Storage
```typescript
import { testDataStorage } from '@/test-data/storage';

// Save and load test data
testDataStorage.save('user', userData);
const loadedData = testDataStorage.load('user');
```

### Pre-push Quality Gates

The comprehensive pre-push hook enforces:
- **Minimum 95% test pass rate**
- **Maximum 5 failing tests**
- **All security tests must pass**
- **Code quality checks must pass**
- **Test data validation must pass**

---

## 🎨 Code Style Guide

### TypeScript Guidelines

#### Import Organization
```typescript
// External libraries first
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Internal imports with @ alias
import { prisma } from '@/lib/prisma';
import { useSession } from 'next-auth/react';
```

#### Component Structure
```typescript
'use client'; // Add for client components

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComponentName() {
  // Hooks first
  const { data: session } = useSession();
  const router = useRouter();
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);

  // Event handlers
  const handleSubmit = async () => {
    // handler logic
  };

  // Conditional renders for auth/loading
  if (!session) return <div>Please sign in</div>;

  // Main JSX return
  return (
    <div className="tailwind-classes">
      {/* Component content */}
    </div>
  );
}
```

#### API Routes Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation
    if (!data.required) {
      return NextResponse.json(
        { error: 'Validation message' },
        { status: 400 }
      );
    }

    // Database operations
    const result = await prisma.model.create({ data });

    return NextResponse.json({ message: 'Success', data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`, `api-route.ts`)
- **Components**: PascalCase (`UserProfile`, `ApiRoute`)
- **Variables**: camelCase (`userData`, `apiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Database Models**: PascalCase (`User`, `Opportunity`)

### Tailwind CSS Guidelines

#### Responsive Design
```typescript
// Use responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

#### Component Styling
```typescript
// Group related classes
<div className="bg-white rounded-lg shadow-lg p-6">
```

#### Semantic Colors
```typescript
// Use semantic color classes
<button className="bg-blue-600 hover:bg-blue-700 text-white">
<button className="bg-red-600 hover:bg-red-700 text-white">
```

---

## 🚀 Deployment Guide

### Environment Setup

#### Development
```bash
# Local development with SQLite
DATABASE_URL="file:./dev.db"
```

#### Production
```bash
# Production with PostgreSQL on Vercel
# Use Vercel environment variables
vercel env pull .env.production.local
```

### Build Process

```bash
# Production build with Prisma generation
bun run build

# Start production server
bun run start
```

### Vercel Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# List deployments
vercel ls
```

---

## 📈 Performance & Monitoring

### Test Metrics Collection

#### Real-time Monitoring
```typescript
import { testMetricsCollector } from '@/lib/test-metrics';

// Record test execution
testMetricsCollector.recordTestResult('test-name', true, 150);

// Record test data usage
testMetricsCollector.recordTestDataUsage('application', 'factory', false, 50);
```

#### Anomaly Detection
- **Performance**: Tests > 30s duration
- **Coverage**: Coverage < 80%
- **Flakiness**: Pass rate 30-70%
- **Integration**: Test data cache hit rate < 50%

### Application Monitoring

#### Error Tracking
```typescript
import { logger } from '@/lib/logger';
import { recordError } from '@/lib/metrics';

try {
  // Application logic
} catch (error) {
  logger.error('Operation failed', { context: 'additional-data' });
  recordError('/api/endpoint', error);
}
```

#### Performance Metrics
```typescript
import { recordApiResponse } from '@/lib/metrics';

// API response time tracking
const startTime = Date.now();
// ... operation ...
recordApiResponse('/api/endpoint', Date.now() - startTime, response.status);
```

---

## 🔒 Security Best Practices

### Authentication & Authorization

#### Password Security
```typescript
import bcrypt from 'bcryptjs';

// Hash passwords with sufficient salt rounds
const hashedPassword = await bcrypt.hash(password, 12);

// Verify passwords
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### Session Management
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// Secure session validation
const session = await getServerSession(authOptions);
if (!session || session.user.role !== 'LEADER') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Input Validation

#### Request Validation
```typescript
import { z } from 'zod';
import { validationErrorResponse } from '@/lib/api-response';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const result = userSchema.safeParse(requestBody);
if (!result.success) {
  return validationErrorResponse(result.error.flatten());
}
```

#### SQL Injection Prevention
```typescript
// Use Prisma ORM for safe database queries
const users = await prisma.user.findMany({
  where: {
    email: userEmail, // Safe parameterized query
  },
});
```

### Data Protection

#### Environment Variables
```bash
# Never commit sensitive data
.env.local
DATABASE_URL=
NEXTAUTH_SECRET=
JWT_SECRET=
```

#### Rate Limiting
```typescript
import { rateLimit } from '@/lib/rate-limit';

// Apply rate limits
if (!rateLimit(`api:${userId}`, 10, 60 * 60 * 1000)) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

---

## 🛠️ Development Tools & Scripts

### Quality Assurance

#### Pre-commit Hooks
```bash
# Automatically runs before each commit:
- ESLint on changed files
- Prettier formatting
- TypeScript type checking
```

#### Pre-push Validation
```bash
# Comprehensive validation before push:
- Unit tests (98.1% pass rate required)
- E2E tests (must pass)
- Security tests (must pass)
- Code quality checks
- Test data validation
```

### Database Management

#### Schema Management
```bash
# Push schema changes to database
bunx prisma db push

# Generate Prisma client
bunx prisma generate

# Browse database
bunx prisma studio
```

#### Data Seeding
```bash
# Populate with demo data
bunx tsx prisma/seed.ts
```

---

## 📚 Additional Documentation

### Feature Documentation
- [BDD Testing](./BDD_TESTING.md) - Behavior-driven development guide
- [E2E Testing](./E2E_TESTING.md) - End-to-end testing guide
- [Accessibility](./ACCESSIBILITY.md) - WCAG 2.1 AA compliance guide
- [Production Best Practices](./PRODUCTION_BEST_PRACTICES.md) - Production deployment guide
- [Observability](./OBSERVABILITY_GUIDE.md) - Monitoring and logging guide

### API Documentation
- OpenAPI/Swagger schema available at `/api/docs`
- Interactive API documentation with request/response examples

### Development Guidelines
- [Agent Guidelines](./AGENTS.md) - Development agent instructions
- [Code Style](./STYLE_GUIDE.md) - Detailed coding standards

---

## 🎯 Quick Reference

### Common Commands
```bash
# Development
bun run dev              # Start dev server
bun run build            # Production build
bun run test              # Run unit tests
bun run test:e2e          # Run E2E tests
bun run lint:fix         # Fix linting issues
bun run format           # Format code

# Database
bunx prisma db push      # Sync schema
bunx prisma generate     # Generate client
bunx prisma studio       # Database browser

# Deployment
vercel --prod            # Deploy to production
vercel env pull          # Sync environment
```

### Test Credentials
```bash
# Volunteer Account
Email: volunteer@demo.com
Password: password123

# Leader Account
Email: leader@demo.com
Password: password123
```

### Environment Variables
```bash
# Required
DATABASE_URL=           # Database connection string
NEXTAUTH_URL=           # NextAuth URL
NEXTAUTH_SECRET=        # NextAuth secret

# Optional
JWT_SECRET=            # JWT signing secret
SENTRY_DSN=            # Error tracking
```

---

*Last Updated: November 23, 2024*
