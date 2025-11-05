import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { SchedulesController } from '@/backend/controllers/schedules/schedulesController';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Schedule title is required' },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { error: 'Schedule date is required' },
        { status: 400 }
      );
    }

    const result = await SchedulesController.createSchedule(user.userId, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Create schedule error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
