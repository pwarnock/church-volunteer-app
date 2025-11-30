import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validators';
import { withErrorHandling } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import {
  validationErrorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';

const handlePost = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedResponse();
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    logger.error('JSON parsing failed', error, {
      userId: session.user.id,
      routeName: 'POST /api/volunteer/profile',
      method: 'POST',
    });
    return NextResponse.json(
      { success: false, error: 'Invalid JSON format', code: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  // Validate request body
  const validationResult = profileSchema.safeParse(body);

  if (!validationResult.success) {
    logger.warn('Profile validation failed', {
      userId: session.user.id,
      errors: validationResult.error.flatten(),
    });
    return validationErrorResponse(validationResult.error.flatten());
  }

  const { spiritualGifts, interests, skills, bio, availability } =
    validationResult.data;

  let existingProfile;
  try {
    existingProfile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.user.id },
    });
  } catch (error) {
    logger.error('Database query failed', error, {
      userId: session.user.id,
      routeName: 'POST /api/volunteer/profile',
      method: 'POST',
    });
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }

  let profile;
  if (existingProfile) {
    profile = await prisma.volunteerProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(spiritualGifts && { spiritualGifts }),
        ...(interests && { interests }),
        ...(skills && { skills }),
        ...(bio !== undefined && { bio }),
        ...(availability && {
          availability:
            typeof availability === 'string'
              ? availability
              : JSON.stringify(availability),
        }),
      },
    });

    logger.info('Volunteer profile updated', {
      userId: session.user.id,
      profileId: profile.id,
    });
  } else {
    profile = await prisma.volunteerProfile.create({
      data: {
        userId: session.user.id!,
        spiritualGifts: spiritualGifts || '[]',
        interests: interests || '[]',
        skills: skills || '[]',
        bio: bio || '',
        availability: availability
          ? typeof availability === 'string'
            ? availability
            : JSON.stringify(availability)
          : '{}',
      },
    });

    logger.info('Volunteer profile created', {
      userId: session.user.id,
      profileId: profile.id,
    });
  }

  return NextResponse.json({ profile });
};

const handleGet = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorizedResponse();
  }

  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  logger.info('Volunteer profile fetched', {
    userId: session.user.id,
    hasProfile: !!profile,
  });

  return NextResponse.json({ profile });
};

export const POST = withErrorHandling(
  handlePost as (request?: NextRequest | undefined) => Promise<NextResponse>,
  'POST /api/volunteer/profile'
);
export const GET = withErrorHandling(
  handleGet as (request?: NextRequest | undefined) => Promise<NextResponse>,
  'GET /api/volunteer/profile'
);
