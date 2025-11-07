import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { MeetingsController } from '@/backend/controllers/meetings/meetingsController';

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
    const { scheduledAt, duration } = body;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'scheduledAt is required' },
        { status: 400 }
      );
    }

    const meeting = await MeetingsController.scheduleMeeting(
      user.userId,
      params.id,
      {
        scheduledAt: new Date(scheduledAt),
        duration,
      }
    );

    return NextResponse.json(meeting);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Meeting request not found') {
      return NextResponse.json({ error: 'Meeting request not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
