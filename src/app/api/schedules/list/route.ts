import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { SchedulesController } from '@/backend/controllers/schedules/schedulesController';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);

    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      courseId: searchParams.get('courseId') || undefined,
      type: searchParams.get('type') || undefined,
    };

    const result = await SchedulesController.listSchedules(user.userId, filters);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('List schedules error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
