import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { AssignmentsController } from '@/backend/controllers/assignments/assignmentsController';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);

    const body = await request.json();
    const { submissionText, submissionUrl } = body;

    if (!submissionText && !submissionUrl) {
      return NextResponse.json(
        { error: 'Either submissionText or submissionUrl is required' },
        { status: 400 }
      );
    }

    const assignment = await AssignmentsController.submitAssignment(
      user.userId,
      params.id,
      { submissionText, submissionUrl }
    );

    return NextResponse.json(assignment);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Assignment not found') {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
