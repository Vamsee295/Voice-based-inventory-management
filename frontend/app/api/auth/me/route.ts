import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Refresh user from DB to ensure they still exist and get latest info
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { business: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role,
      businessId: user.businessId,
      businessName: user.business.name
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
