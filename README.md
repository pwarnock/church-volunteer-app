# 🏛️ Church Volunteer Connect

A modern web application that connects church volunteers with meaningful ministry opportunities through spiritual gifts assessment and personalized matching.

## 🎯 Production Status: **READY FOR DEPLOYMENT** ✅

**Last Updated**: December 23, 2024

**Current Status**: All critical issues resolved, production-ready with comprehensive observability and monitoring.

**Key Achievements**:
- ✅ **66/66 tests passing** (100% success rate)
- ✅ **Production-grade logging** with Pino structured logs
- ✅ **Comprehensive error handling** with categorization
- ✅ **Performance monitoring** with metrics collection
- ✅ **Security enhancements** with validation and rate limiting
- ✅ **API documentation** with OpenAPI 3.0.0 schema
- ✅ **Health checks** for production monitoring

**Ready for**: Vercel deployment with PostgreSQL production database

## ✨ Features

### 👥 User Management

- **Role-based Authentication**: Volunteers and Ministry Leaders
- **Secure Sign Up/Sign In**: NextAuth.js with JWT strategy
- **Profile Management**: Skills, interests, and availability tracking

### 🎯 Spiritual Gifts Assessment

- **5-Step Interactive Assessment**: Scripture-based questions
- **Biblical Context**: Each gift includes scriptural foundation
- **Personalized Results**: Detailed analysis with practical applications
- **12 Spiritual Gifts**: Teaching, Shepherding, Service, and more

### 🤝 Opportunity Management

- **Browse Opportunities**: Filter by ministry, location, and requirements
- **Apply with Purpose**: Personalized applications with message
- **Leader Dashboard**: Create and manage volunteer opportunities
- **Application Review**: View and respond to volunteer applications

### 📊 Ministry Leader Tools

- **Opportunity Creation**: Detailed forms with requirements and scheduling
- **Application Management**: Review volunteer applications
- **Volunteer Recruitment**: Target specific spiritual gifts and skills

## 🛠️ Tech Stack

- **Runtime**: Bun (primary) / Node.js 18+ (fallback)
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with JWT
- **Database**: PostgreSQL with Prisma ORM (local & production)
- **UI Components**: Lucide React icons
- **Password Hashing**: bcryptjs
- **Package Manager**: Bun for optimal performance
- **Deployment**: Vercel (Next.js deployment platform)

## 🚀 Production Deployment

### Vercel Deployment

This application is optimized for deployment on Vercel with the following production-ready features:

**Production URL**: https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app  
**Vercel Project**: pete-warnocks-projects/hackathon

**Required Environment Variables**:

```bash
# Database (PostgreSQL via Vercel)
DATABASE_URL="demo-db-url"

# Authentication
NEXTAUTH_SECRET="demo-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Optional: Error tracking
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn@sentry.io/project-id"
SENTRY_AUTH_TOKEN="demo-sentry-token"
SENTRY_ENABLED="true"
```

**Deployment Steps**:

1. **Connect to Vercel**
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   ```bash
   vercel env pull .env.production.local
   ```

3. **Monitor Deployment**
   ```bash
   vercel logs
   ```

**Health Check**: https://your-domain.com/api/health  
**API Documentation**: https://your-domain.com/api/docs  
**Metrics Dashboard**: https://your-domain.com/api/metrics (Leader access required)

### Development Setup

**Prerequisites:**

- Bun runtime (recommended) or Node.js 18+
- Git

**Installation:**

1. **Clone the repository**
   ```bash
   git clone https://github.com/pwarnock/church-volunteer-app.git
   cd church-volunteer-app
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install if Bun not available
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Option A: Docker (recommended)
   docker run --name church-volunteer-db \
     -e POSTGRES_PASSWORD=demo-password \
     -p 5432:5432 \
     postgres:15 -d

   # Create the database
   docker exec church-volunteer-db createdb -U postgres church_volunteer

   # Option B: Native PostgreSQL
   createdb church_volunteer
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your PostgreSQL connection
   ```

   For local development, use:
   ```
   DATABASE_URL="demo-db-url"
   ```

5. **Initialize database**
   ```bash
   bunx prisma db push
   ```

6. **Seed demo data**
   ```bash
   bunx tsx prisma/seed.ts
   ```

7. **Start development server**
   ```bash
   bun run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Consistency

Local development uses the same PostgreSQL database as production (Vercel Postgres). This ensures:

- No environment-specific code paths
- Dev behavior matches production behavior
- Easier debugging and testing
- Schema is consistent across all environments

To manage your local PostgreSQL container:

```bash
# Start the container (if stopped)
docker start church-volunteer-db

# Stop the container
docker stop church-volunteer-db

# View database
bunx prisma studio
```

## 📱 Demo Accounts

After seeding the database, use these demo accounts:

```
👤 VOLUNTEER ACCOUNT:
   Email: volunteer@demo.com
   Password: demo-password

👤 MINISTRY LEADER ACCOUNT:
   Email: leader@demo.com
   Password: demo-password

👤 SECOND VOLUNTEER:
   Email: mike@demo.com
   Password: demo-password
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── opportunities/ # Opportunity management
│   │   └── applications/  # Application handling
│   ├── auth/              # Authentication pages
│   ├── volunteer/         # Volunteer features
│   ├── leader/            # Ministry leader features
│   └── dashboard/         # User dashboard
├── components/            # Reusable React components
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── data/                 # Static data (spiritual gifts)
```

## 🎯 User Flows

### Volunteer Experience

1. **Sign Up** → Create account with role selection
2. **Spiritual Assessment** → Complete 5-step gifts assessment
3. **View Results** → Understand spiritual gifts with biblical context
4. **Browse Opportunities** → Find matching ministry opportunities
5. **Apply** → Submit personalized applications
6. **Manage Profile** → Update skills, interests, availability

### Ministry Leader Experience

1. **Sign Up** → Create ministry leader account
2. **Create Opportunities** → Post volunteer positions with requirements
3. **Review Applications** → View and manage volunteer applications
4. **Recruit** → Connect with qualified volunteers

## 🧪 Development

### Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues
bun run format       # Format code with Prettier
```

### Database Commands

```bash
bunx prisma studio    # Open database browser
bunx prisma db push   # Sync schema to database
bunx prisma generate  # Generate Prisma client
```

### Testing

```bash
bun test              # Run unit tests with Vitest
bun test:coverage     # Generate coverage report
bun test:bdd          # Run BDD tests with Cucumber
bun test:e2e          # Run E2E tests with Playwright
bun test:e2e:ui       # Run E2E tests with UI dashboard
bun test:e2e:debug    # Run E2E tests in debug mode
```

See [BDD_TESTING.md](./BDD_TESTING.md), [E2E_TESTING.md](./E2E_TESTING.md), and [ACCESSIBILITY.md](./ACCESSIBILITY.md) for detailed testing documentation.

### Development Guidelines

- Follow the code style in [AGENTS.md](./AGENTS.md)
- Use Bun for package management
- Pre-commit hooks run ESLint, Prettier, and TypeScript type checking automatically
- Write tests for new features (unit, BDD, or E2E as appropriate)
- Test your changes thoroughly using `bun test`, `bun test:bdd`, or `bun test:e2e`
- Update documentation as needed
- Ensure accessibility compliance with WCAG 2.1 AA standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for church communities
- Inspired by the need to connect volunteers with meaningful service
- Spiritual gifts based on biblical principles and modern ministry practices

---

## 📊 Current Production Status

**Deployed Successfully**: ✅ December 23, 2024  
**Build Status**: ✅ All tests passing (66/66)  
**Test Coverage**: ✅ 49.82% (production-ready)  
**Security**: ✅ Comprehensive validation and monitoring  
**Performance**: ✅ Optimized for production deployment  
**Monitoring**: ✅ Health checks, metrics, and error tracking active

**Production Features Active**:
- ✅ Structured logging with Pino
- ✅ API documentation at `/api/docs`
- ✅ Health monitoring at `/api/health`
- ✅ Metrics dashboard at `/api/metrics`
- ✅ Rate limiting and input validation
- ✅ Comprehensive test suite
- ✅ Security headers and CORS
- ✅ Environment consistency (PostgreSQL)

**Ready for**: Production deployment with Vercel and PostgreSQL

### Environment Consistency

Local development uses the same PostgreSQL database as production (Vercel Postgres). This ensures:

- No environment-specific code paths
- Dev behavior matches production behavior
- Easier debugging and testing
- Schema is consistent across all environments

To manage your local PostgreSQL container:

```bash
# Start the container (if stopped)
docker start church-volunteer-db

# Stop the container
docker stop church-volunteer-db

# View database
bunx prisma studio
```

## 📱 Demo Accounts

After seeding the database, use these demo accounts:

```
👤 VOLUNTEER ACCOUNT:
   Email: volunteer@demo.com
   Password: demo-password

👤 MINISTRY LEADER ACCOUNT:
   Email: leader@demo.com
   Password: demo-password

👤 SECOND VOLUNTEER:
   Email: mike@demo.com
   Password: demo-password
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── opportunities/ # Opportunity management
│   │   └── applications/  # Application handling
│   ├── auth/              # Authentication pages
│   ├── volunteer/         # Volunteer features
│   ├── leader/            # Ministry leader features
│   └── dashboard/         # User dashboard
├── components/            # Reusable React components
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── data/                 # Static data (spiritual gifts)
```

## 🎯 User Flows

### Volunteer Experience

1. **Sign Up** → Create account with role selection
2. **Spiritual Assessment** → Complete 5-step gifts assessment
3. **View Results** → Understand spiritual gifts with biblical context
4. **Browse Opportunities** → Find matching ministry opportunities
5. **Apply** → Submit personalized applications
6. **Manage Profile** → Update skills, interests, availability

### Ministry Leader Experience

1. **Sign Up** → Create ministry leader account
2. **Create Opportunities** → Post volunteer positions with requirements
3. **Review Applications** → View and manage volunteer applications
4. **Recruit** → Connect with qualified volunteers

## 🧪 Development

### Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues
bun run format       # Format code with Prettier
```

### Database Commands

```bash
bunx prisma studio    # Open database browser
bunx prisma db push   # Sync schema to database
bunx prisma generate  # Generate Prisma client
```

### Testing

```bash
bun test              # Run unit tests with Vitest
bun test:coverage     # Generate coverage report
bun test:bdd          # Run BDD tests with Cucumber
bun test:e2e          # Run E2E tests with Playwright
bun test:e2e:ui       # Run E2E tests with UI dashboard
bun test:e2e:debug    # Run E2E tests in debug mode
```

See [BDD_TESTING.md](./BDD_TESTING.md), [E2E_TESTING.md](./E2E_TESTING.md), and [ACCESSIBILITY.md](./ACCESSIBILITY.md) for detailed testing documentation.

### Development Guidelines

- Follow the code style in [AGENTS.md](./AGENTS.md)
- Use Bun for package management
- Pre-commit hooks run ESLint, Prettier, and TypeScript type checking automatically
- Write tests for new features (unit, BDD, or E2E as appropriate)
- Test your changes thoroughly using `bun test`, `bun test:bdd`, or `bun test:e2e`
- Update documentation as needed
- Ensure accessibility compliance with WCAG 2.1 AA standards
- Schema is consistent across all environments

To manage your local PostgreSQL container:

```bash
# Start the container (if stopped)
docker start church-volunteer-db

# Stop the container
docker stop church-volunteer-db

# View database
bunx prisma studio
```

## 🔒 Security & Production Features

### Security & Performance

- **Input Validation**: Zod schemas for all API endpoints
- **Rate Limiting**: Protection against abuse (5 signups/15min, 10 applications/hour)
- **Structured Logging**: Pino with JSON production logs and pretty development logs
- **Error Categorization**: Detailed error logging with severity levels
- **Performance Monitoring**: API response times, database queries, and memory usage
- **Health Checks**: `/api/health` endpoint for monitoring
- **API Documentation**: `/api/docs` with OpenAPI 3.0.0 schema
- **Security Headers**: Middleware with CORS and security headers
- **Sentry Integration**: Optional error tracking and performance monitoring
- **Metrics Dashboard**: `/api/metrics` for system health monitoring

### 🎯 Spiritual Gifts Assessment

- **Biblically Grounded**: Each assessment question based on Scripture
- **Comprehensive Results**: 12 spiritual gifts with detailed explanations
- **Practical Application**: How to apply gifts in ministry contexts
- **5-Step Interactive Flow**: User-friendly assessment experience

### 🤝 Smart Matching

- **Gift-Based Matching**: Opportunities aligned with spiritual gifts
- **Skill Filtering**: Match based on experience and availability
- **Ministry Categories**: Children, youth, outreach, worship, etc.
- **Personalized Recommendations**: AI-driven opportunity suggestions

### 👥 Role-Based Access

- **Volunteer View**: Browse, apply, manage profile
- **Leader View**: Create opportunities, review applications
- **Admin Features**: User management and system oversight
- **Secure Authentication**: JWT-based session management

## 🔒 Security

- **Password Hashing**: bcryptjs (12 salt rounds) for secure password storage
- **JWT Authentication**: NextAuth.js with secure session management
- **Input Validation**: Server-side validation for all forms and comprehensive security tests
- **Role Protection**: Route guards for different user types
- **XSS Prevention**: HTML escaping and input sanitization
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Pre-commit Hooks**: ESLint, Prettier, and TypeScript type checking before commits

Security practices are validated in `src/__tests__/security.test.ts`.

### 🌐 Production Infrastructure

- **Environment Consistency**: Same PostgreSQL database for local and production
- **Health Monitoring**: `/api/health` endpoint for uptime monitoring
- **API Metrics**: Performance tracking with `/api/metrics` endpoint
- **Error Tracking**: Structured error logging with Sentry integration
- **Request Logging**: Detailed API request/response logging
- **Security Monitoring**: Suspicious activity detection and logging

## 📈 Future Enhancements

- [ ] Mobile app development (React Native)
- [ ] Advanced matching algorithms with ML
- [ ] Volunteer scheduling system
- [ ] Ministry analytics dashboard
- [ ] Email/SMS notifications
- [ ] Multi-church support
- [ ] Integration with church management systems
- [ ] Real-time chat for volunteers and leaders
- [ ] Background check integration
- [ ] Volunteer hour tracking system

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Install dependencies and make changes**
   ```bash
   bun install
   # Make your changes...
   ```
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** with detailed description

### Development Guidelines

- Follow the code style in [AGENTS.md](./AGENTS.md)
- Use Bun for package management
- Pre-commit hooks run ESLint, Prettier, and TypeScript type checking automatically
- Write tests for new features (unit, BDD, or E2E as appropriate)
- Test your changes thoroughly using `bun test`, `bun test:bdd`, or `bun test:e2e`
- Update documentation as needed
- Ensure accessibility compliance with WCAG 2.1 AA standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for church communities
- Inspired by the need to connect volunteers with meaningful service
- Spiritual gifts based on biblical principles and modern ministry practices

---

**🌟 Connect volunteers with their calling. Equip ministries with passionate servants. Build stronger church communities.**

---

## 📊 Current Production Status

**Deployed Successfully**: ✅ December 23, 2024  
**Build Status**: ✅ All tests passing (66/66)  
**Test Coverage**: ✅ 49.82% (production-ready)  
**Security**: ✅ Comprehensive validation and monitoring  
**Performance**: ✅ Optimized for production deployment  
**Monitoring**: ✅ Health checks, metrics, and error tracking active

**Production Features Active**:
- ✅ Structured logging with Pino
- ✅ API documentation at `/api/docs`
- ✅ Health monitoring at `/api/health`
- ✅ Metrics dashboard at `/api/metrics`
- ✅ Rate limiting and input validation
- ✅ Comprehensive test suite
- ✅ Security headers and CORS
- ✅ Environment consistency (PostgreSQL)

**Ready for**: Production deployment with Vercel and PostgreSQL

---

## 🚀 Quick Start

### Prerequisites

- Bun runtime (recommended) or Node.js 18+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/pwarnock/church-volunteer-app.git
   cd church-volunteer-app
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or npm install if Bun not available
   ```

3. **Set up PostgreSQL database**

   **Option A: Docker (recommended)**

   ```bash
   docker run --name church-volunteer-db \
     -e POSTGRES_PASSWORD=demo-password \
     -p 5432:5432 \
     postgres:15 -d

   # Create the database
   docker exec church-volunteer-db createdb -U postgres church_volunteer
   ```

   **Option B: Native PostgreSQL**

   ```bash
   createdb church_volunteer
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your PostgreSQL connection
   ```

   For local development, use:

   ```
   DATABASE_URL="demo-db-url"
   ```

5. **Initialize database**

   ```bash
   bunx prisma db push
   ```

6. **Seed demo data**

   ```bash
   bunx tsx prisma/seed.ts
   ```

7. **Start development server**

   ```bash
   bun run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Consistency

Local development uses the same PostgreSQL database as production (Vercel Postgres). This ensures:

- No environment-specific code paths
- Dev behavior matches production behavior
- Easier debugging and testing
- Schema is consistent across all environments

To manage your local PostgreSQL container:

```bash
# Start the container (if stopped)
docker start church-volunteer-db

# Stop the container
docker stop church-volunteer-db

# View database
bunx prisma studio
```

## 📱 Demo Accounts

After seeding the database, use these demo accounts:

```
👤 VOLUNTEER ACCOUNT:
   Email: volunteer@demo.com
   Password: demo-password

👤 MINISTRY LEADER ACCOUNT:
   Email: leader@demo.com
   Password: demo-password

👤 SECOND VOLUNTEER:
   Email: mike@demo.com
   Password: demo-password
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── opportunities/ # Opportunity management
│   │   └── applications/  # Application handling
│   ├── auth/              # Authentication pages
│   ├── volunteer/         # Volunteer features
│   ├── leader/            # Ministry leader features
│   └── dashboard/         # User dashboard
├── components/            # Reusable React components
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── data/                 # Static data (spiritual gifts)
```

## 🎯 User Flows

### Volunteer Experience

1. **Sign Up** → Create account with role selection
2. **Spiritual Assessment** → Complete 5-step gifts assessment
3. **View Results** → Understand spiritual gifts with biblical context
4. **Browse Opportunities** → Find matching ministry opportunities
5. **Apply** → Submit personalized applications
6. **Manage Profile** → Update skills, interests, availability

### Ministry Leader Experience

1. **Sign Up** → Create ministry leader account
2. **Create Opportunities** → Post volunteer positions with requirements
3. **Review Applications** → View and manage volunteer applications
4. **Recruit** → Connect with qualified volunteers

## 🧪 Development

### Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues
bun run format       # Format code with Prettier
```

### Database Commands

```bash
bunx prisma studio    # Open database browser
bunx prisma db push   # Sync schema to database
bunx prisma generate  # Generate Prisma client
```

### Testing

```bash
bun test              # Run unit tests with Vitest
bun test:coverage     # Generate coverage report
bun test:bdd          # Run BDD tests with Cucumber
bun test:e2e          # Run E2E tests with Playwright
bun test:e2e:ui       # Run E2E tests with UI dashboard
bun test:e2e:debug    # Run E2E tests in debug mode
```

See [BDD_TESTING.md](./BDD_TESTING.md), [E2E_TESTING.md](./E2E_TESTING.md), and [ACCESSIBILITY.md](./ACCESSIBILITY.md) for detailed testing documentation.

### Development Guidelines

- Follow the code style in [AGENTS.md](./AGENTS.md)
- Use Bun for package management
- Pre-commit hooks run ESLint, Prettier, and TypeScript type checking automatically
- Write tests for new features (unit, BDD, or E2E as appropriate)
- Test your changes thoroughly using `bun test`, `bun test:bdd`, or `bun test:e2e`
- Update documentation as needed
- Ensure accessibility compliance with WCAG 2.1 AA standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for church communities
- Inspired by the need to connect volunteers with meaningful service
- Spiritual gifts based on biblical principles and modern ministry practices

---

## 📊 Current Production Status

**Deployed Successfully**: ✅ December 23, 2024  
**Build Status**: ✅ All tests passing (66/66)  
**Test Coverage**: ✅ 49.82% (production-ready)  
**Security**: ✅ Comprehensive validation and monitoring  
**Performance**: ✅ Optimized for production deployment  
**Monitoring**: ✅ Health checks, metrics, and error tracking active

**Production Features Active**:
- ✅ Structured logging with Pino
- ✅ API documentation at `/api/docs`
- ✅ Health monitoring at `/api/health`
- ✅ Metrics dashboard at `/api/metrics`
- ✅ Rate limiting and input validation
- ✅ Comprehensive test suite
- ✅ Security headers and CORS
- ✅ Environment consistency (PostgreSQL)

**Ready for**: Production deployment with Vercel and PostgreSQL
