import { cookies } from 'next/headers';
import type { AuthUser } from '@erp/types';

const TOKEN_COOKIE = 'erp_token';
const USER_COOKIE = 'erp_user';

export async function setSession(accessToken: string, user: AuthUser): Promise<void> {
  const jar = await cookies();
  const common = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  jar.set(TOKEN_COOKIE, accessToken, common);
  jar.set(USER_COOKIE, JSON.stringify(user), { ...common, httpOnly: false });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
  jar.delete(USER_COOKIE);
}
