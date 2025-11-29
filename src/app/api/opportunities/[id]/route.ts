import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

async function handleDelete(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'MINISTRY_LEADER') {
    return unauthorizedResponse();
  }

  const opportunityId = params.id;

  // Verify the opportunity belongs to the leader
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    select: { leaderId: true },
  });

  if (!opportunity) {
    return notFoundResponse('Opportunity');
  }

  // Check authorization: only MINISTRY_LEADER can delete opportunities
  // User must be the opportunity leader
  if (opportunity.leaderId !== session.user.id) {
    return unauthorizedResponse();
  }

  // Only MINISTRY_LEADER can delete opportunities (not VOLUNTEER)
  if (session.user.role === 'VOLUNTEER') {
    return unauthorizedResponse();
  }

  // Delete the opportunity
  await prisma.opportunity.delete({
    where: { id: opportunityId },
  });

  logger.info('Opportunity deleted', {
    userId: session.user.id,
    opportunityId,
  });

  return NextResponse.json(
    { success: true, message: 'Opportunity deleted successfully' },
    { status: 200 }
  );
}

export const DELETE = withErrorHandling(
  handleDelete as (
    request?: NextRequest | undefined,
    context?: any
  ) => Promise<NextResponse>,
  'DELETE /api/opportunities/[id]'
);
