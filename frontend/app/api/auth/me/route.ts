import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Suresh R.',
      email: 'operator@store.com',
      businessName: 'Sri Balaji Wholesale',
      role: 'Supervisor',
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-voicemate-key-2026');
    const { payload } = await jose.jwtVerify(token, secret);
    return NextResponse.json({
      id: payload.id || '11111111-1111-1111-1111-111111111111',
      name: (payload.name as string) || 'Suresh R.',
      email: (payload.email as string) || 'operator@store.com',
      businessName: (payload.businessName as string) || 'Sri Balaji Wholesale',
      role: (payload.role as string) || 'Supervisor',
    });
  } catch {
    return NextResponse.json({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Suresh R.',
      email: 'operator@store.com',
      businessName: 'Sri Balaji Wholesale',
      role: 'Supervisor',
    });
  }
}
