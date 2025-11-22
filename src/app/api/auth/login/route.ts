import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()
    
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function initializeDatabase() {
  try {
    // Check if any users exist
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      console.log('Initializing database with demo data...')
      
      // Create demo ministry leader
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('demo123', 12)
      
      await prisma.user.create({
        data: {
          email: 'leader@demo.com',
          name: 'Demo Ministry Leader',
          password: hashedPassword,
          role: 'MINISTRY_LEADER'
        }
      })
      
      // Create demo volunteer
      await prisma.user.create({
        data: {
          email: 'volunteer@demo.com',
          name: 'Demo Volunteer',
          password: hashedPassword,
          role: 'VOLUNTEER'
        }
      })
      
      console.log('Demo users created successfully')
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}