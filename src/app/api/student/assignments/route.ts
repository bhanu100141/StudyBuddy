import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { AssignmentsController } from '@/backend/controllers/assignments/assignmentsController';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const assignments = await AssignmentsController.getStudentAssignments(user.userId);
    return NextResponse.json({ assignments });
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
