import { prisma } from '@/backend/lib/prisma';

export class AssignmentsController {
  // Teacher creates an assignment
  static async createAssignment(data: {
    teacherId: string;
    studentId: string;
    title: string;
    description: string;
    type: 'TASK' | 'EXAM' | 'QUIZ' | 'PROJECT';
    dueDate: Date;
    totalMarks?: number;
  }) {
    // Verify the teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: data.teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    // Verify the student exists
    const student = await prisma.user.findUnique({
      where: { id: data.studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new Error('Student not found');
    }

    const assignment = await prisma.assignment.create({
      data: {
        teacherId: data.teacherId,
        studentId: data.studentId,
        title: data.title,
        description: data.description,
        type: data.type,
        dueDate: data.dueDate,
        totalMarks: data.totalMarks,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return assignment;
  }

  // Get all assignments by teacher
  static async getTeacherAssignments(teacherId: string) {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    const assignments = await prisma.assignment.findMany({
      where: { teacherId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assignments;
  }

  // Get student's assignments
  static async getStudentAssignments(studentId: string) {
    const assignments = await prisma.assignment.findMany({
      where: { studentId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return assignments;
  }

  // Grade an assignment
  static async gradeAssignment(
    teacherId: string,
    assignmentId: string,
    data: {
      marksObtained: number;
      feedback?: string;
    }
  ) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new Error('Unauthorized. You can only grade your own assignments.');
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        marksObtained: data.marksObtained,
        feedback: data.feedback,
        status: 'GRADED',
      },
      include: {
        student: {
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

  // Delete assignment
  static async deleteAssignment(teacherId: string, assignmentId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new Error('Unauthorized. You can only delete your own assignments.');
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return { success: true };
  }

  // Submit assignment (student)
  static async submitAssignment(
    studentId: string,
    assignmentId: string,
    data: {
      submissionText?: string;
      submissionUrl?: string;
    }
  ) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.studentId !== studentId) {
      throw new Error('Unauthorized. This assignment is not assigned to you.');
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        submissionText: data.submissionText,
        submissionUrl: data.submissionUrl,
        status: 'SUBMITTED',
      },
    });

    return updated;
  }
}
