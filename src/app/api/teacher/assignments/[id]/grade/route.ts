import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { AssignmentsController } from '@/backend/controllers/assignments/assignmentsController';

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
    const { marksObtained, feedback } = body;

    if (marksObtained === undefined) {
      return NextResponse.json(
        { error: 'marksObtained is required' },
        { status: 400 }
      );
    }

    const assignment = await AssignmentsController.gradeAssignment(
      user.userId,
      params.id,
      { marksObtained, feedback }
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
