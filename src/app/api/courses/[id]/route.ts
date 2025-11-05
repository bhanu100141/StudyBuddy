import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { CoursesController } from '@/backend/controllers/courses/coursesController';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const result = await CoursesController.getCourse(user.userId, params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get course error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Course not found') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const result = await CoursesController.updateCourse(user.userId, params.id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Update course error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Course not found') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const result = await CoursesController.deleteCourse(user.userId, params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Delete course error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Course not found') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
