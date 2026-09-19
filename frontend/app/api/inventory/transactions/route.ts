import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/lib/prisma';

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
    const { productId, intent, quantity, unit, source, reference, idempotencyKey } = body;
    const businessId = authPayload.businessId as string;
    const operatorId = authPayload.userId as string;

    if (!productId || !intent || !quantity || !unit || !source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check Idempotency Key first
    if (idempotencyKey) {
      const existingTx = await prisma.inventoryTransaction.findUnique({
        where: { idempotencyKey }
      });
      if (existingTx) {
        return NextResponse.json({ 
          message: 'Already processed',
          transaction: existingTx 
        }, { status: 200 });
      }
    }

    // Process atomically
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Get product, ensure it belongs to this business
      const product = await tx.product.findFirst({
        where: { id: productId, businessId }
      });

      if (!product) {
        throw new Error('Product not found or unauthorized');
      }

      const previousBalance = product.currentStock;
      
      // Calculate change
      // Assume TUNE already normalized quantity (frontend passes normalized quantity)
      let change = 0;
      if (intent === 'STOCK_IN') {
        change = quantity;
      } else if (intent === 'STOCK_OUT') {
        change = -quantity;
      }

      const newBalance = previousBalance + change;

      if (newBalance < 0) {
        throw new Error('Insufficient stock for this operation');
      }

      // 2. Update Product
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { currentStock: newBalance }
      });

      // 3. Create Transaction Ledger Entry
      const transactionRecord = await tx.inventoryTransaction.create({
        data: {
          productId: product.id,
          businessId,
          type: intent,
          quantity: Math.abs(change),
          unit,
          source,
          operatorId,
          previousBalance,
          newBalance,
          reference: reference || null,
          idempotencyKey: idempotencyKey || null,
          status: 'COMMITTED'
        }
      });

      return { product: updatedProduct, transaction: transactionRecord };
    });

    return NextResponse.json({ 
      success: true, 
      product: result.product,
      transaction: result.transaction
    });
  } catch (error: any) {
    console.error('Transaction commit error:', error);
    
    // Distinguish expected validation errors from 500s
    if (error.message.includes('Insufficient stock') || error.message.includes('unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
