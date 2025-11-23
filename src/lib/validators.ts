import { z } from 'zod';

// Auth Validators
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['VOLUNTEER', 'MINISTRY_LEADER']).default('VOLUNTEER'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Opportunity Validators
export const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  ministry: z.string().min(1, 'Ministry is required').max(100),
  location: z.string().min(1, 'Location is required').max(200),
  requirements: z.array(z.string()).min(0).max(20),
  timeCommitment: z.string().min(1, 'Time commitment is required').max(200),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  leaderId: z.string().min(1, 'Leader ID is required'),
});

// Application Validators
export const applicationSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  volunteerId: z.string().min(1, 'Volunteer ID is required'),
  message: z.string().max(1000, 'Message too long').optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
});

// Profile Validators
export const profileSchema = z.object({
  bio: z.string().max(500, 'Bio too long').optional(),
  spiritualGifts: z.string().optional(),
  interests: z.string().optional(),
  availability: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().max(1000).optional(),
});

// Type exports for use in components
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
