# AGENTS.md - Church Volunteer Connect Development Guidelines

## 🚀 Development Commands

### Build & Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build with Prisma generation
npm run start        # Start production server
npm run lint         # Run ESLint on codebase
```

### Database Operations
```bash
npx prisma db push   # Sync schema to database
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open database browser
npx tsx prisma/seed.ts  # Populate demo data
```

### Testing
```bash
# No test framework configured yet - add testing commands when implemented
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

### Database Patterns
- Use Prisma client from `@/lib/prisma`
- Handle JSON fields with `JSON.stringify()` and `JSON.parse()`
- Use transactions for multiple operations
- Include proper error handling for database operations

### Authentication
- Use `useSession()` for client-side auth state
- Protect routes with session checks
- Use `signOut()` for logout functionality
- Handle loading states during auth operations