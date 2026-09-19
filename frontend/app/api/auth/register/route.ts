import { NextResponse } from 'next/server';
import * as jose from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
    const token = await new jose.SignJWT({
      id: '11111111-1111-1111-1111-111111111111',
      email: email,
      name: name || 'Suresh R.',
      businessName: businessName || 'Sri Balaji Wholesale',
      role: 'ADMIN',
      business_id: '00000000-0000-0000-0000-000000000001',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        name: name || 'Suresh R.',
        email: email,
        businessName: businessName || 'Sri Balaji Wholesale',
        role: 'Supervisor',
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
