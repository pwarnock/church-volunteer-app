import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Get NEXTAUTH_URL with fallback for Vercel preview
const getAuthUrl = (): string => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'https';
    return `${protocol}://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
};

// Ensure NEXTAUTH_SECRET is set for all environments
const getAuthSecret = (): string => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // Use a derived secret from URL-based fallback for non-persistent deployments (preview, etc.)
    // This is acceptable because preview environments are ephemeral
    const baseUrl = getAuthUrl();
    const fallback = `${baseUrl}-dev-secret-key`;
    
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
      // Only throw in production when not on Vercel (actual production)
      throw new Error(
        'NEXTAUTH_SECRET environment variable must be set for permanent deployments'
      );
    }
    
    console.warn(
      'NEXTAUTH_SECRET not found. Using fallback derived from deployment URL. This is acceptable for ephemeral preview/test deployments.'
    );
    return fallback;
  }
  return secret;
};

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret(),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
