import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // 1. Static files & Next.js internals: always pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Landing page (/) is ALWAYS public!
  // Opening the project or navigating to / must always render the landing page.
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 3. Auth routes: public
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/api/auth');

  if (isAuthRoute) {
    // If user already has a valid token and visits /login or /register, redirect to /home
    if (token && (pathname === '/login' || pathname === '/register')) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
        await jose.jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/home', request.url));
      } catch {
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }
    }
    return NextResponse.next();
  }

  // 4. Protected routes: check token
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
    await jose.jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT Verification failed:', error);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

