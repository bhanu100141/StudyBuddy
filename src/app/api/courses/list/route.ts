import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { CoursesController } from '@/backend/controllers/courses/coursesController';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const result = await CoursesController.listCourses(user.userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('List courses error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
