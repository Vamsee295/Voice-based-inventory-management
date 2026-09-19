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
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Fetch products matching query
    const products = await prisma.product.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
          { barcode: { contains: query } }
        ]
      },
      take: limit,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ results: products });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
