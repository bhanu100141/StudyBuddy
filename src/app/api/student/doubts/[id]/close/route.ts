import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { DoubtsController } from '@/backend/controllers/doubts/doubtsController';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const doubtId = params.id;

    const doubt = await DoubtsController.closeDoubt(doubtId, user.userId);
    return NextResponse.json(doubt);
  } catch (error: any) {
    console.error('Error in POST /api/student/doubts/[id]/close:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Doubt not found') {
      return NextResponse.json({ error: 'Doubt not found' }, { status: 404 });
    }
    if (error.message.includes('can only close')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
