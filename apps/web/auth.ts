import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { AuthUser, Role } from '@erp/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) {
          return null;
        }

        const data = (await res.json()) as { accessToken: string; user: AuthUser };
        // Returned object is merged into the JWT via the `jwt` callback below.
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          accessToken: data.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.accessToken = (user as { accessToken: string }).accessToken;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
