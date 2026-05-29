import type { Role } from '@erp/types';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role;
    accessToken?: string;
  }
}
