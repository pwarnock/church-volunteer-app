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

    const { opportunityId, message } = await request.json()

    const existingApplication = await prisma.application.findUnique({
      where: {
        opportunityId_volunteerId: {
          opportunityId,
          volunteerId: session.user.id!
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this opportunity' },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        opportunityId,
        volunteerId: session.user.id!,
        message: message || ''
      },
      include: {
        opportunity: {
          include: {
            leader: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Application error:', error)
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

    const { searchParams } = new URL(request.url)
    const role = session.user.role

    let applications
    if (role === 'MINISTRY_LEADER') {
      applications = await prisma.application.findMany({
        where: {
          opportunity: {
            leaderId: session.user.id
          }
        },
        include: {
          opportunity: {
            select: {
              title: true,
              ministry: true
            }
          },
          volunteer: {
            select: {
              name: true,
              email: true,
              profile: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      applications = await prisma.application.findMany({
        where: {
          volunteerId: session.user.id
        },
        include: {
          opportunity: {
            select: {
              title: true,
              ministry: true,
              leader: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}