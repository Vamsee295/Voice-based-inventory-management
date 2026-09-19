import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Protect all routes except /login, /api/auth, /_next, etc
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/api/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isPublicFile = request.nextUrl.pathname.match(/\.(.*)$/);

  if (!token) {
    if (!isAuthRoute && !request.nextUrl.pathname.startsWith('/_next') && !isPublicFile) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
    await jose.jwtVerify(token, secret);
    
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/inventory', request.url));
    }
    
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/inventory', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('JWT Verification failed:', error);
    if (isApiRoute) {
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
