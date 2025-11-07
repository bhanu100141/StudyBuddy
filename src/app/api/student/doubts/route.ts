import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { DoubtsController } from '@/backend/controllers/doubts/doubtsController';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const doubts = await DoubtsController.getStudentDoubts(user.userId);
    return NextResponse.json({ doubts });
  } catch (error: any) {
    console.error('Error in GET /api/student/doubts:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const body = await request.json();
    const { subject, question, preferredTeacherId } = body;

    if (!subject || !question) {
      return NextResponse.json(
        { error: 'Subject and question are required' },
        { status: 400 }
      );
    }

    const doubt = await DoubtsController.createDoubt({
      studentId: user.userId,
      subject,
      question,
      preferredTeacherId,
    });

    return NextResponse.json(doubt, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/student/doubts:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
