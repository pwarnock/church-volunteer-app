# AGENTS.md - Church Volunteer Connect Development Guidelines

## 🥯 Package Manager: Bun
This project uses Bun as the primary package manager. Always use `bun` instead of `npm` for faster performance.

## 🌐 Deployment: Vercel
- **Production URL**: https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app
- **Vercel Project**: pete-warnocks-projects/hackathon
- **Authentication**: Vercel deployment protection enabled
- **Database**: PostgreSQL on Vercel (production), SQLite (local)
- **Environment**: Use `vercel env pull` to sync production variables

## 🚀 Development Commands

### Build & Development
```bash
bun run dev          # Start development server (localhost:3000)
bun run build        # Production build with Prisma generation
bun run start        # Start production server
bun run lint         # Run ESLint on codebase
```

### Database Operations
```bash
bunx prisma db push   # Sync schema to database
bunx prisma generate  # Generate Prisma client
bunx prisma studio    # Open database browser
bunx tsx prisma/seed.ts  # Populate demo data
```

### Testing
```bash
bun test                 # Run unit tests with Vitest
bun test:ui             # Run tests with UI dashboard
bun test:coverage       # Generate coverage report
bun test:bdd            # Run BDD tests with Cucumber
bun test:e2e            # Run E2E tests with Playwright
bun test:e2e:ui         # Run E2E tests with UI mode
bun test:e2e:debug      # Run E2E tests in debug mode
```

### Test Types
- **Unit Tests**: Test individual functions, utilities, and components (`src/**/*.test.ts`)
- **BDD Tests**: Test complete user workflows and features (`features/**/*.feature`)
- **E2E Tests**: Test entire application flows in real browsers (`e2e/**/*.spec.ts`)
- **Security Tests**: Validate secure coding practices (`src/__tests__/security.test.ts`)
- **Accessibility Tests**: WCAG 2.1 AA compliance (`src/__tests__/accessibility.test.ts`, `e2e/accessibility.spec.ts`)
- See [BDD_TESTING.md](./BDD_TESTING.md), [E2E_TESTING.md](./E2E_TESTING.md), and [ACCESSIBILITY.md](./ACCESSIBILITY.md) for documentation

### Vercel Deployment
```bash
vercel --prod                    # Deploy to production
vercel env pull .env.production.local  # Pull production env vars
vercel logs                      # View deployment logs
vercel ls                        # List deployments
```

## 📋 Code Style Guidelines

### Import Organization
```typescript
// External libraries first
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Internal imports with @ alias
import { prisma } from '@/lib/prisma'
import { useSession } from 'next-auth/react'
```

### Component Structure
```typescript
'use client'  // Add for client components

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ComponentName() {
  // Hooks first
  const { data: session } = useSession()
  const router = useRouter()
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {
    // effect logic
  }, [dependencies])
  
  // Event handlers
  const handleSubmit = async () => {
    // handler logic
  }
  
  // Conditional renders for auth/loading
  if (!session) return <div>Please sign in</div>
  
  // Main JSX return
  return (
    <div className="tailwind-classes">
      {/* Component content */}
    </div>
  )
}
```

### API Routes Structure
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validation
    if (!data.required) {
      return NextResponse.json(
        { error: 'Validation message' },
        { status: 400 }
      )
    }
    
    // Database operations
    const result = await prisma.model.create({ data })
    
    return NextResponse.json({ message: 'Success', data: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Known Issues & Solutions
- **Vercel Auth Protection**: Production deployment requires bypass token
- **Database Sync**: Use `bunx prisma db push` after schema changes
- **Environment Variables**: Pull with `vercel env pull` for production

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`, `api-route.ts`)
- **Components**: PascalCase (`UserProfile`, `ApiRoute`)
- **Variables**: camelCase (`userData`, `apiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Database Models**: PascalCase (`User`, `Opportunity`)

### Error Handling
```typescript
// API routes - structured error responses
return NextResponse.json(
  { error: 'Descriptive error message' },
  { status: appropriate_http_code }
)

// Components - user-friendly error states
const [error, setError] = useState('')
if (error) {
  return <div className="text-red-600">{error}</div>
}

// Async operations - try/catch with logging
try {
  const result = await operation()
} catch (error) {
  console.error('Operation failed:', error)
  setError('Operation failed. Please try again.')
}
```

### TypeScript Guidelines
- Use `interface` for object shapes
- Add proper return types to functions
- Use `any` sparingly - prefer `unknown` with type guards
- Leverage Prisma generated types
- Use `const` by default, `let` only when reassignment needed

### Styling with Tailwind
- Use responsive prefixes: `md:grid-cols-2`, `lg:grid-cols-3`
- Group related classes: `className="bg-white rounded-lg shadow-lg p-6"`
- Use semantic color classes: `text-blue-600`, `bg-red-50`
- Add hover states: `hover:bg-blue-700`, `transition-colors`
- **Input Text**: Ensure `text-gray-900` for visibility

### Database Patterns
- Use Prisma client from `@/lib/prisma`
- Handle JSON fields with `JSON.stringify()` and `JSON.parse()`
- Use transactions for multiple operations
- Include proper error handling for database operations
- Use `bunx` for Prisma CLI commands in development
- **Production**: Uses PostgreSQL via Vercel Postgres
- **Local**: Uses SQLite for development

### Authentication
- Use `useSession()` for client-side auth state
- Protect routes with session checks
- Use `signOut()` for logout functionality
- Handle loading states during auth operations
- **NextAuth Configuration**: JWT strategy, no PrismaAdapter
- **Demo Accounts**: See README for working credentials