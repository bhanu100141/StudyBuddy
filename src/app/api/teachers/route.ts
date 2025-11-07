import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { prisma } from '@/backend/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    // Fetch all teachers
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error('Error in GET /api/teachers:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
