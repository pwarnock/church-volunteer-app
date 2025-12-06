/**
 * Volunteer Profile API Route Tests
 *
 * Domain: API route testing
 * Responsibility: Test volunteer profile CRUD operations
 * Boundaries: API endpoint only, no database setup
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing the route
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    volunteerProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth-options', () => ({
  authOptions: {},
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocking
import { POST } from '@/app/api/volunteer/profile/route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

describe('/api/volunteer/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mock implementations
    (getServerSession as any).mockReset();
    (prisma.volunteerProfile.findUnique as any).mockReset();
    (prisma.volunteerProfile.create as any).mockReset();
    (prisma.volunteerProfile.update as any).mockReset();

    // Set default mock behaviors
    (getServerSession as any).mockResolvedValue(null);
    (prisma.volunteerProfile.findUnique as any).mockResolvedValue(null);
    (prisma.volunteerProfile.create as any).mockResolvedValue(null);
    (prisma.volunteerProfile.update as any).mockResolvedValue(null);
  });

  describe('POST /api/volunteer/profile', () => {
    it('should create or update volunteer profile', async () => {
      // Arrange
      const mockSession = { user: { id: 'volunteer1', role: 'VOLUNTEER' } };
      (getServerSession as any).mockResolvedValue(mockSession);

      const mockProfile = {
        id: 'profile1',
        userId: 'volunteer1',
        bio: 'Passionate about serving',
        spiritualGifts: '["Service", "Encouragement"]',
        interests: '["Youth ministry", "Outreach"]',
        availability: '{"weekends": true, "weekdays": "evenings"}',
        skills: '["Teaching", "Mentoring"]',
        experience: '2 years in youth ministry',
      };
      (prisma.volunteerProfile.findUnique as any).mockResolvedValue(null);
      (prisma.volunteerProfile.create as any).mockResolvedValue(mockProfile);

      const requestBody = {
        bio: 'Passionate about serving',
        spiritualGifts: '["Service", "Encouragement"]',
        interests: '["Youth ministry", "Outreach"]',
        availability: '{"weekends": true, "weekdays": "evenings"}',
        skills: '["Teaching", "Mentoring"]',
        experience: '2 years in youth ministry',
      };

      const validRequestBody = {
        bio: 'Passionate about serving',
        spiritualGifts: '["Service", "Encouragement"]',
        interests: '["Youth ministry", "Outreach"]',
        availability: '{"weekends": true, "weekdays": "evenings"}',
        skills: '["Teaching", "Mentoring"]',
        experience: '2 years in youth ministry',
      };

      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/volunteer/profile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.profile).toEqual(mockProfile);
      expect(prisma.volunteerProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'volunteer1',
          bio: 'Passionate about serving',
          spiritualGifts: '["Service", "Encouragement"]',
          interests: '["Youth ministry", "Outreach"]',
          availability: '{"weekends": true, "weekdays": "evenings"}',
          skills: '["Teaching", "Mentoring"]',
        },
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      // Arrange
      (getServerSession as any).mockResolvedValue(null);

      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/volunteer/profile',
        {
          method: 'POST',
          body: JSON.stringify({ bio: 'Test bio' }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid request body', async () => {
      // Arrange
      const mockSession = { user: { id: 'volunteer1', role: 'VOLUNTEER' } };
      (getServerSession as any).mockResolvedValue(mockSession);

      const invalidBody = {
        bio: 123, // Invalid type - should be string
      };

      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/volunteer/profile',
        {
          method: 'POST',
          body: JSON.stringify(invalidBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it.skip('should handle JSON parsing errors', async () => {
      // Arrange
      const mockSession = { user: { id: 'volunteer1', role: 'VOLUNTEER' } };
      (getServerSession as any).mockResolvedValue(mockSession);

      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/volunteer/profile',
        {
          method: 'POST',
          body: 'invalid json',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const response = await POST(request);

      // Assert - JSON parsing errors are caught by middleware and return 500
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
      expect(data.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Error Handling', () => {
    it.skip('should handle database errors gracefully', async () => {
      // Arrange
      const mockSession = { user: { id: 'volunteer1', role: 'VOLUNTEER' } };
      (getServerSession as any).mockResolvedValue(mockSession);

      (prisma.volunteerProfile.create as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      const requestBody = {
        bio: 'Test bio',
        spiritualGifts: '["Service"]',
        interests: '["Youth"]',
        availability: '{}',
        skills: '[]',
        experience: '',
      };

      // Act
      const request = new NextRequest(
        'http://localhost:3000/api/volunteer/profile',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const response = await POST(request);

      // Assert - Database errors are caught by middleware and return 500
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
      expect(data.code).toBe('INTERNAL_ERROR');
    });
  });
});
