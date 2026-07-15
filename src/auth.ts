import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { userService } from '@/features/auth/services/user-service';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      organizationId: string;
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    organizationId: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await userService.getUserByEmail(
          credentials.email as string
        );
        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          organizationId: user.organization_id,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.organizationId = user.organizationId;
      } else if (!token.organizationId && token.sub) {
        // Fallback for existing sessions that don't have organizationId yet
        const dbUser = await userService.getUserById(token.sub);
        if (dbUser) {
          token.organizationId = dbUser.organization_id;
        }
      }
      return token;
    },
  },
  session: { strategy: 'jwt' },
});
