import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/backend/controllers/auth/authController';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await AuthController.login(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('credentials') ? 401 : 500 }
    );
  }
}
