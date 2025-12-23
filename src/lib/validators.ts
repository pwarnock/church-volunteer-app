import { z } from 'zod';

// Enhanced password strength validation
const passwordRequirements = [
  {
    test: (password: string) => password.length >= 8,
    message: 'Password must be at least 8 characters long',
  },
  {
    test: (password: string) => /[A-Z]/.test(password),
    message: 'Password must contain at least one uppercase letter',
  },
  {
    test: (password: string) => /[a-z]/.test(password),
    message: 'Password must contain at least one lowercase letter',
  },
  {
    test: (password: string) => /[0-9]/.test(password),
    message: 'Password must contain at least one number',
  },
  {
    test: (password: string) => !/(.)\1{2,}/.test(password),
    message: 'Password cannot contain 3+ repeated characters in a row',
  },
  {
    test: (password: string) =>
      !/(password|123456|qwerty|admin|user)/i.test(password),
    message: 'Password cannot contain common or weak patterns',
  },
];

// Check password strength
const isStrongPassword = (password: string) => {
  const failed = passwordRequirements.filter((req) => !req.test(password));
  return {
    isValid: failed.length === 0,
    errors: failed.map((req) => req.message),
    score: calculatePasswordStrength(password),
  };
};

// Calculate password strength score (0-100)
const calculatePasswordStrength = (password: string): number => {
  let score = 0;

  // Length contributes up to 40 points
  score += Math.min(password.length * 4, 40);

  // Character variety
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 20;
  if (/(password|123456|qwerty|admin)/i.test(password)) score -= 30;

  return Math.max(0, Math.min(100, score));
};

// Auth Validators
export const signupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine((password) => {
      const { isValid } = isStrongPassword(password);
      return isValid;
    }, 'Password does not meet security requirements'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .refine((name) => !/<script|javascript|onclick|onerror/i.test(name), {
      message: 'Name contains invalid characters',
    }),
  role: z.enum(['VOLUNTEER', 'MINISTRY_LEADER']).default('VOLUNTEER'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
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
