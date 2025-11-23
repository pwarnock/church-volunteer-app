import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { applicationSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 applications per 60 minutes per user
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!rateLimit(`apply:${session.user.id}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many applications. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = applicationSchema.safeParse({
      ...body,
      volunteerId: session.user.id!,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { opportunityId, message } = validationResult.data;

    const existingApplication = await prisma.application.findUnique({
      where: {
        opportunityId_volunteerId: {
          opportunityId,
          volunteerId: session.user.id!,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this opportunity' },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        opportunityId,
        volunteerId: session.user.id!,
        message: message || '',
      },
      include: {
        opportunity: {
          include: {
            leader: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;

    let applications;
    if (role === 'MINISTRY_LEADER') {
      applications = await prisma.application.findMany({
        where: {
          opportunity: {
            leaderId: session.user.id,
          },
        },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              ministry: true,
            },
          },
          volunteer: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      applications = await prisma.application.findMany({
        where: {
          volunteerId: session.user.id,
        },
        include: {
          opportunity: {
            select: {
              title: true,
              ministry: true,
              leader: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
