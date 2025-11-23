# 🏛️ Church Volunteer Connect

A modern web application that connects church volunteers with meaningful ministry opportunities through spiritual gifts assessment and personalized matching.

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
     -e POSTGRES_PASSWORD=password \
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
   DATABASE_URL="postgresql://postgres:password@localhost:5432/church_volunteer"
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

## 📱 Demo Accounts

After seeding the database, use these demo accounts:

```
👤 VOLUNTEER ACCOUNT:
   Email: volunteer@demo.com
   Password: password123

👤 MINISTRY LEADER ACCOUNT:
   Email: leader@demo.com
   Password: password123

👤 SECOND VOLUNTEER:
   Email: mike@demo.com
   Password: password123
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
```

### Database Commands

```bash
bunx prisma studio    # Open database browser
bunx prisma db push   # Sync schema to database
bunx prisma generate  # Generate Prisma client
```

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

## 🌟 Key Features

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

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure session management
- **Input Validation**: Server-side validation for all forms
- **Role Protection**: Route guards for different user types

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
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for church communities
- Inspired by the need to connect volunteers with meaningful service
- Spiritual gifts based on biblical principles and modern ministry practices

---

**🌟 Connect volunteers with their calling. Equip ministries with passionate servants. Build stronger church communities.**
