import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Role-gated route protection. This is a UX gate; the API enforces real authorization.
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;
  const path = nextUrl.pathname;

  const isLogin = path === '/login';

  if (!session) {
    if (isLogin) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Logged in but on /login → send to their home.
  if (isLogin) {
    return NextResponse.redirect(new URL(homeFor(role), nextUrl));
  }

  // Cross-role protection.
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(homeFor(role), nextUrl));
  }
  if (path.startsWith('/supervisor') && role !== 'SUPERVISOR' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(homeFor(role), nextUrl));
  }
  if (path.startsWith('/partner') && role !== 'PARTNER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(homeFor(role), nextUrl));
  }

  return NextResponse.next();
});

function homeFor(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SUPERVISOR':
      return '/supervisor';
    case 'PARTNER':
      return '/partner';
    default:
      return '/login';
  }
}

export const config = {
  // Protect everything except static assets and the Auth.js API.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
