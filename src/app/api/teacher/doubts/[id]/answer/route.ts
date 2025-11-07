import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { DoubtsController } from '@/backend/controllers/doubts/doubtsController';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);

    if (user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { answer } = body;

    if (!answer) {
      return NextResponse.json(
        { error: 'Answer is required' },
        { status: 400 }
      );
    }

    const doubt = await DoubtsController.answerDoubt(user.userId, params.id, answer);
    return NextResponse.json(doubt);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Doubt not found') {
      return NextResponse.json({ error: 'Doubt not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
