import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applicationSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { withErrorHandling } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { recordRateLimitHit } from '@/lib/metrics';
import {
  rateLimitResponse,
  validationErrorResponse,
  createdResponse,
  unauthorizedResponse,
  errorResponse,
} from '@/lib/api-response';

const handlePost = async (request: NextRequest) => {
  // Rate limiting: 10 applications per 60 minutes per user
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedResponse();
  }

  if (!rateLimit(`apply:${session.user.id}`, 10, 60 * 60 * 1000)) {
    logger.warn('Application rate limit exceeded', {
      userId: session.user.id,
    });
    recordRateLimitHit('/api/applications', session.user.id);
    return rateLimitResponse('Too many applications. Please try again later.');
  }

  const body = await request.json();

  // Validate request body
  const validationResult = applicationSchema.safeParse({
    ...body,
    volunteerId: session.user.id!,
  });

  if (!validationResult.success) {
    logger.warn('Application validation failed', {
      userId: session.user.id,
      errors: validationResult.error.flatten(),
    });
    return validationErrorResponse(validationResult.error.flatten());
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
    logger.warn('Duplicate application attempt', {
      userId: session.user.id,
      opportunityId,
    });
    return errorResponse('You have already applied for this opportunity', 400);
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

  logger.info('Application created successfully', {
    userId: session.user.id,
    applicationId: application.id,
    opportunityId,
  });

  return createdResponse(application, 'Application submitted successfully');
};

const handleGet = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedResponse();
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

  logger.info('Applications fetched', {
    userId: session.user.id,
    count: applications.length,
    role,
  });

  return NextResponse.json({ applications });
};

export const POST = withErrorHandling(
  handlePost as (request?: NextRequest | undefined) => Promise<NextResponse>,
  'POST /api/applications'
);
export const GET = withErrorHandling(
  handleGet as (request?: NextRequest | undefined) => Promise<NextResponse>,
  'GET /api/applications'
);
