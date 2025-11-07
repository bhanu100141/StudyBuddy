import { prisma } from '@/backend/lib/prisma';

export class MeetingsController {
  // Student creates a meeting request
  static async createMeetingRequest(data: {
    studentId: string;
    type: 'DOUBT_CLARIFICATION' | 'EXAM' | 'DISCUSSION';
    subject: string;
    description: string;
    doubtId?: string;
    preferredTeacherId?: string;
  }) {
    const student = await prisma.user.findUnique({
      where: { id: data.studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new Error('Unauthorized. Student access required.');
    }

    // If doubtId is provided, verify it exists
    if (data.doubtId) {
      const doubt = await prisma.doubt.findUnique({
        where: { id: data.doubtId },
      });

      if (!doubt || doubt.studentId !== data.studentId) {
        throw new Error('Invalid doubt ID');
      }
    }

    const meeting = await prisma.meetingRequest.create({
      data: {
        studentId: data.studentId,
        type: data.type,
        subject: data.subject,
        description: data.description,
        doubtId: data.doubtId,
        preferredTeacherId: data.preferredTeacherId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        preferredTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doubt: true,
      },
    });

    return meeting;
  }

  // Get all meeting requests (for teachers)
  static async getAllMeetingRequests(teacherId: string) {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    const meetings = await prisma.meetingRequest.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        preferredTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doubt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return meetings;
  }

  // Get student's meeting requests
  static async getStudentMeetingRequests(studentId: string) {
    const meetings = await prisma.meetingRequest.findMany({
      where: { studentId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        preferredTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doubt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return meetings;
  }

  // Teacher accepts and schedules a meeting
  static async scheduleMeeting(
    teacherId: string,
    meetingId: string,
    data: {
      scheduledAt: Date;
      duration?: number;
    }
  ) {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    const meeting = await prisma.meetingRequest.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting request not found');
    }

    // Generate Google Meet link (simplified - in production, use Google Meet API)
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;

    const updated = await prisma.meetingRequest.update({
      where: { id: meetingId },
      data: {
        teacherId,
        status: 'SCHEDULED',
        scheduledAt: data.scheduledAt,
        duration: data.duration || 30,
        meetLink,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doubt: true,
      },
    });

    return updated;
  }

  // Complete a meeting
  static async completeMeeting(meetingId: string, userId: string) {
    const meeting = await prisma.meetingRequest.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting request not found');
    }

    if (meeting.studentId !== userId && meeting.teacherId !== userId) {
      throw new Error('Unauthorized.');
    }

    const updated = await prisma.meetingRequest.update({
      where: { id: meetingId },
      data: {
        status: 'COMPLETED',
      },
    });

    return updated;
  }

  // Cancel a meeting
  static async cancelMeeting(meetingId: string, userId: string) {
    const meeting = await prisma.meetingRequest.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting request not found');
    }

    if (meeting.studentId !== userId && meeting.teacherId !== userId) {
      throw new Error('Unauthorized.');
    }

    const updated = await prisma.meetingRequest.update({
      where: { id: meetingId },
      data: {
        status: 'CANCELLED',
      },
    });

    return updated;
  }
}
