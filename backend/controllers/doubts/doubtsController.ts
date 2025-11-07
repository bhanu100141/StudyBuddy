import { prisma } from '@/backend/lib/prisma';

export class DoubtsController {
  // Student creates a doubt
  static async createDoubt(data: {
    studentId: string;
    subject: string;
    question: string;
    preferredTeacherId?: string;
  }) {
    const student = await prisma.user.findUnique({
      where: { id: data.studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new Error('Unauthorized. Student access required.');
    }

    const doubt = await prisma.doubt.create({
      data: {
        studentId: data.studentId,
        subject: data.subject,
        question: data.question,
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
      },
    });

    return doubt;
  }

  // Get all doubts (for teachers)
  static async getAllDoubts(teacherId: string) {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    const doubts = await prisma.doubt.findMany({
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
        meetingRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return doubts;
  }

  // Get student's doubts
  static async getStudentDoubts(studentId: string) {
    const doubts = await prisma.doubt.findMany({
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
        meetingRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return doubts;
  }

  // Answer a doubt (teacher)
  static async answerDoubt(
    teacherId: string,
    doubtId: string,
    answer: string
  ) {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
    });

    if (!doubt) {
      throw new Error('Doubt not found');
    }

    const updated = await prisma.doubt.update({
      where: { id: doubtId },
      data: {
        teacherId,
        answer,
        status: 'ANSWERED',
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
      },
    });

    return updated;
  }

  // Close a doubt
  static async closeDoubt(doubtId: string, userId: string) {
    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
    });

    if (!doubt) {
      throw new Error('Doubt not found');
    }

    if (doubt.studentId !== userId && doubt.teacherId !== userId) {
      throw new Error('Unauthorized. You can only close your own doubts.');
    }

    const updated = await prisma.doubt.update({
      where: { id: doubtId },
      data: {
        status: 'CLOSED',
      },
    });

    return updated;
  }
}
