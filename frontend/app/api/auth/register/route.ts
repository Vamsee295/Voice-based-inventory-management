import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name, businessName } = await req.json();

    if (!email || !password || !name || !businessName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create Business and User atomically
    const result = await prisma.$transaction(async (tx: any) => {
      const business = await tx.business.create({
        data: { name: businessName },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          businessId: business.id,
          role: 'OWNER'
        },
      });

      return { user, business };
    });

    return NextResponse.json({ 
      message: 'Registration successful',
      user: { id: result.user.id, email: result.user.email, name: result.user.name },
      business: result.business
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
