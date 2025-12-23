import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate credentials format
          const { email, password } = credentialsSchema.parse(credentials);
          
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user) {
            console.log(`No user found for email: ${email}`);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            console.log(`Invalid password for email: ${email}`);
            return null;
          }

          // Return user object (excluding password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secret: process.env.NEXTAUTH_SECRET,
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth account linking
      if (account?.provider === 'google' && user) {
        // Check if this is a new OAuth user
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // Create new user from OAuth
          const randomPassword = Math.random().toString(36) + Date.now().toString(36);
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              role: 'VOLUNTEER', // Default role for OAuth users
              password: await bcrypt.hash(randomPassword, 12), // Random password for OAuth users
            },
          });
          
          user.id = newUser.id;
          user.role = 'VOLUNTEER';
        } else {
          // Link existing user to OAuth account
          user.id = existingUser.id;
          user.role = existingUser.role;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Add user data to token on sign in
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        
        // Add provider info
        if (account) {
          token.provider = account.provider;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Add user data to session
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.role = token.role as string;
        session.user.provider = token.provider;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed up via ${account?.provider}:`, user.email);
      } else {
        console.log(`Existing user signed in via ${account?.provider}:`, user.email);
      }
    },
    
    async signOut({ session }) {
      console.log(`User signed out: ${session?.user?.email}`);
    },
  },
  
  // Security settings
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
};