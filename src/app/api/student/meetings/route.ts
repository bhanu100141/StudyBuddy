import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { MeetingsController } from '@/backend/controllers/meetings/meetingsController';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const meetings = await MeetingsController.getStudentMeetingRequests(user.userId);
    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error('Error in GET /api/student/meetings:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const body = await request.json();
    const { type, subject, description, doubtId, preferredTeacherId } = body;

    if (!type || !subject || !description) {
      return NextResponse.json(
        { error: 'Type, subject, and description are required' },
        { status: 400 }
      );
    }

    const meeting = await MeetingsController.createMeetingRequest({
      studentId: user.userId,
      type,
      subject,
      description,
      doubtId,
      preferredTeacherId,
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/student/meetings:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Invalid doubt ID') {
      return NextResponse.json({ error: 'Invalid doubt ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
