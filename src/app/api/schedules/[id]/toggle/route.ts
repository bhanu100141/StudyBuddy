import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { SchedulesController } from '@/backend/controllers/schedules/schedulesController';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const result = await SchedulesController.toggleComplete(user.userId, params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Toggle schedule error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Schedule not found') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
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
