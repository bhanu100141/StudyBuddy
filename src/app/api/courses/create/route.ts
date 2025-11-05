import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { CoursesController } from '@/backend/controllers/courses/coursesController';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      );
    }

    const result = await CoursesController.createCourse(user.userId, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Create course error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
