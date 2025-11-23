import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { opportunitySchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        leader: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Opportunities fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'MINISTRY_LEADER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 20 opportunities per 60 minutes per leader
    if (!rateLimit(`opportunities:${session.user.id}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many opportunities created. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = opportunitySchema.safeParse({
      ...body,
      leaderId: session.user.id!,
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

    const {
      title,
      description,
      ministry,
      location,
      requirements,
      timeCommitment,
      startDate,
      endDate,
    } = validationResult.data;

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        ministry,
        location,
        requirements: JSON.stringify(requirements || []),
        timeCommitment,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        leaderId: session.user.id!,
      },
      include: {
        leader: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Opportunity creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
