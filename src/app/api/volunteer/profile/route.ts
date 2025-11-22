import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { spiritualGifts, interests, skills, bio, availability } = await request.json()

    const existingProfile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.user.id }
    })

    let profile
    if (existingProfile) {
      profile = await prisma.volunteerProfile.update({
        where: { userId: session.user.id },
        data: {
          ...(spiritualGifts && { spiritualGifts }),
          ...(interests && { interests }),
          ...(skills && { skills }),
          ...(bio !== undefined && { bio }),
          ...(availability && { availability })
        }
      })
    } else {
      profile = await prisma.volunteerProfile.create({
        data: {
          userId: session.user.id,
          spiritualGifts: spiritualGifts || '[]',
          interests: interests || '[]',
          skills: skills || '[]',
          bio: bio || '',
          availability: availability || {}
        }
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}