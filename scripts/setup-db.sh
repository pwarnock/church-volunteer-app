#!/usr/bin/env bash

echo "🔧 Church Volunteer Connect - Database Setup"
echo "=========================================="

# Check if .env.local exists, if not copy from template
if [ ! -f .env.local ]; then
  echo "📋 Creating .env.local from template..."
  cp .env.template .env.local
  echo "✅ Created .env.local with default settings"
fi

# Setup database based on environment
if [ "$NODE_ENV" = "production" ]; then
  echo "🌐 Production environment detected"
  echo "Using PostgreSQL database"
  
  # Check if POSTGRES_URL is set
  if [ -z "$POSTGRES_URL" ]; then
    echo "❌ POSTGRES_URL not set in production environment"
    exit 1
  fi
  
  # Use production schema
  cp prisma/schema-prod.prisma prisma/schema.prisma
  
  # Generate Prisma client
  echo "🔨 Generating Prisma client..."
  bunx prisma generate || npx prisma generate
  
  # Push schema to production
  echo "📤 Pushing schema to production database..."
  bunx prisma db push || npx prisma db push
  
  # Seed production if needed
  echo "🌱 Seeding production database..."
  bunx tsx prisma/seed.ts || npx tsx prisma/seed.ts
else
  echo "💻 Development environment detected"
  echo "Using SQLite database"
  
  # Ensure LOCAL_DB_URL is set (default works for most cases)
  if [ -z "$LOCAL_DB_URL" ]; then
    export LOCAL_DB_URL="file:./prisma/dev.db"
  fi
  
  # Use local schema
  cp prisma/schema-local.prisma prisma/schema.prisma
  
  # Generate Prisma client
  echo "🔨 Generating Prisma client..."
  bunx prisma generate || npx prisma generate
  
  # Push schema to local SQLite
  echo "📤 Pushing schema to local SQLite database..."
  bunx prisma db push || npx prisma db push
  
  # Seed local database
  echo "🌱 Seeding local database..."
  # Using SQLite-compatible seed
  bunx tsx prisma/seed-local.ts || npx tsx prisma/seed-local.ts
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Demo Login Credentials:"
echo "─────────────────────────────────────"
echo "👤 VOLUNTEER ACCOUNT:"
echo "   Email: volunteer@demo.com"
echo "   Password: password123"
echo ""
echo "👤 MINISTRY LEADER ACCOUNT:"
echo "   Email: leader@demo.com"
echo "   Password: password123"
echo ""
echo "👤 SECOND VOLUNTEER:"
echo "   Email: mike@demo.com"
echo "   Password: password123"
echo "─────────────────────────────────────"