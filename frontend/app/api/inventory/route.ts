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
    
    // Fetch products for this business
    const products = await prisma.product.findMany({
      where: { businessId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const body = await req.json();
    const { name, sku, barcode, description, category, baseUnit, currentStock, reorderLevel, unitPrice } = body;
    const businessId = authPayload.businessId as string;

    if (!name || !sku || !baseUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        description: description || null,
        category: category || 'General',
        baseUnit,
        currentStock: currentStock || 0,
        reorderLevel: reorderLevel || 0,
        unitPrice: unitPrice || 0,
        businessId
      }
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'SKU or Barcode already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
