import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { opportunitySchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { trackApiError, logger } from '@/lib/logger';
import { withErrorHandling } from '@/lib/api-middleware';
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
      applications: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Transform opportunities to include count
  const opportunitiesWithCount = opportunities.map((opportunity) => ({
    ...opportunity,
    _count: {
      applications: opportunity.applications.length,
    },
  }));

  logger.info('Opportunities fetched', {
    count: opportunitiesWithCount.length,
  });

  return NextResponse.json({ opportunities: opportunitiesWithCount });
};

const handlePost = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'MINISTRY_LEADER') {
    return unauthorizedResponse();
  }

  // Rate limiting: 20 opportunities per 60 minutes per leader
  if (!rateLimit(`opportunities:${session.user.id}`, 20, 60 * 60 * 1000)) {
    trackApiError(new Error('Rate limit exceeded'), {
      endpoint: '/api/opportunities',
      method: 'POST',
      userId: session.user.id,
    });
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
    trackApiError(new Error('Validation failed'), {
      endpoint: '/api/opportunities',
      method: 'POST',
      userId: session.user.id,
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
