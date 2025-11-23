import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { opportunitySchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { withErrorHandling } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { recordRateLimitHit } from '@/lib/metrics';
import {
  rateLimitResponse,
  validationErrorResponse,
  createdResponse,
  unauthorizedResponse,
} from '@/lib/api-response';

const handleGet = async () => {
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

  logger.info('Opportunities fetched', {
    count: opportunities.length,
  });

  return NextResponse.json({ opportunities });
};

const handlePost = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'MINISTRY_LEADER') {
    return unauthorizedResponse();
  }

  // Rate limiting: 20 opportunities per 60 minutes per leader
  if (!rateLimit(`opportunities:${session.user.id}`, 20, 60 * 60 * 1000)) {
    logger.warn('Opportunity creation rate limit exceeded', {
      userId: session.user.id,
    });
    recordRateLimitHit('/api/opportunities', session.user.id);
    return rateLimitResponse(
      'Too many opportunities created. Please try again later.'
    );
  }

  const body = await request.json();

  // Validate request body
  const validationResult = opportunitySchema.safeParse({
    ...body,
    leaderId: session.user.id!,
  });

  if (!validationResult.success) {
    logger.warn('Opportunity validation failed', {
      userId: session.user.id,
      errors: validationResult.error.flatten(),
    });
    return validationErrorResponse(validationResult.error.flatten());
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

  logger.info('Opportunity created successfully', {
    userId: session.user.id,
    opportunityId: opportunity.id,
    title: opportunity.title,
  });

  return createdResponse(opportunity, 'Opportunity created successfully');
};

export const GET = withErrorHandling(
  handleGet as (request?: NextRequest | undefined) => Promise<NextResponse>,
  'GET /api/opportunities'
);
export const POST = withErrorHandling(
  handlePost as (request?: NextRequest | undefined) => Promise<NextResponse>,
  'POST /api/opportunities'
);
