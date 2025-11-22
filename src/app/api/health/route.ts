import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}