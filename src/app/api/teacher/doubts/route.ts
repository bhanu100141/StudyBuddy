import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { DoubtsController } from '@/backend/controllers/doubts/doubtsController';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    if (user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const doubts = await DoubtsController.getAllDoubts(user.userId);
    return NextResponse.json({ doubts });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
