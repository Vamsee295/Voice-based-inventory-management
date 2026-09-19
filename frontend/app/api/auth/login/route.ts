import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Auto-create user and default workspace for any email entered
      let business = await prisma.business.findFirst();
      if (!business) {
        business = await prisma.business.create({
          data: { name: 'Main Workspace' }
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const namePart = normalizedEmail.split('@')[0];
      const displayName = namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : 'Operator';

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          name: displayName,
          businessId: business.id,
          role: 'OPERATOR'
        }
      });
    } else {
      // If user already exists, update password if needed to allow login
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        const newHashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHashedPassword }
        });
      }
    }

    // Generate JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
    const alg = 'HS256';
    
    const token = await new jose.SignJWT({ 
        userId: user.id, 
        email: user.email, 
        businessId: user.businessId,
        role: user.role
      })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set HTTP-only cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, businessId: user.businessId }
    });
    
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
