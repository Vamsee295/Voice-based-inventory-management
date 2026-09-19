import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let authPayload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
    const { payload } = await jose.jwtVerify(token, secret);
    authPayload = payload;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const businessId = authPayload.businessId as string;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const productId = searchParams.get('productId');
    
    const where: any = { businessId };
    if (productId) {
      where.productId = productId;
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        product: { select: { name: true } }
      }
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
