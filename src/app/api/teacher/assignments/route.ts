import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { AssignmentsController } from '@/backend/controllers/assignments/assignmentsController';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    if (user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const assignments = await AssignmentsController.getTeacherAssignments(user.userId);
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

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    if (user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studentId, title, description, type, dueDate, totalMarks } = body;

    if (!studentId || !title || !description || !type || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignment = await AssignmentsController.createAssignment({
      teacherId: user.userId,
      studentId,
      title,
      description,
      type,
      dueDate: new Date(dueDate),
      totalMarks,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Student not found') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
