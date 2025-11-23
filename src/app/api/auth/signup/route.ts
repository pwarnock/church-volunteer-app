import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import {
  recordAuthAttempt,
  recordError,
  recordRateLimitHit,
} from '@/lib/metrics';
import {
  rateLimitResponse,
  validationErrorResponse,
  internalErrorResponse,
  createdResponse,
  errorResponse,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Rate limiting: 5 signup attempts per 15 minutes per IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000)) {
      logger.warn('Signup rate limit exceeded', { ip });
      recordRateLimitHit('signup', 'anonymous');
      return rateLimitResponse(
        'Too many signup attempts. Please try again later.'
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Signup validation failed', { email: body.email });
      return validationErrorResponse(validationResult.error.flatten());
    }

    const { name, email, password, role } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('Signup attempted with existing email', { email });
      return errorResponse('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const duration = Date.now() - startTime;
    recordAuthAttempt('signup', true, duration);

    return createdResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      'User created successfully'
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    recordAuthAttempt('signup', false, duration);

    if (error instanceof Error) {
      recordError(error, { endpoint: 'signup' });
    }

    const context =
      error instanceof Error && 'email' in error
        ? { email: (error as Record<string, unknown>).email }
        : undefined;
    logger.error('Signup error', error, context);
    return internalErrorResponse();
  }
}
