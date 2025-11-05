import { prisma } from '@/backend/lib/prisma';

export class TeacherController {
  static async getAllStudents(teacherId: string) {
    // Verify the user is a teacher
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    // Get all students with their activity counts
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            chats: true,
            materials: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get total message count for each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const totalMessages = await prisma.message.count({
          where: {
            chat: {
              userId: student.id,
            },
          },
        });

        const recentActivity = await prisma.chat.findFirst({
          where: { userId: student.id },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        });

        return {
          ...student,
          totalMessages,
          lastActive: recentActivity?.updatedAt || student.updatedAt,
        };
      })
    );

    return {
      students: studentsWithDetails,
      totalStudents: students.length,
    };
  }

  static async getStudentDetails(teacherId: string, studentId: string) {
    // Verify the user is a teacher
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get student's chats
    const chats = await prisma.chat.findMany({
      where: { userId: studentId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get student's materials
    const materials = await prisma.material.findMany({
      where: { userId: studentId },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get total message count
    const totalMessages = await prisma.message.count({
      where: {
        chat: {
          userId: studentId,
        },
      },
    });

    return {
      student,
      chats,
      materials,
      totalMessages,
      statistics: {
        totalChats: chats.length,
        totalMaterials: materials.length,
        totalMessages,
      },
    };
  }

  static async getTeacherStats(teacherId: string) {
    // Verify the user is a teacher
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Unauthorized. Teacher access required.');
    }

    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' },
    });

    const totalChats = await prisma.chat.count();
    const totalMaterials = await prisma.material.count();
    const totalMessages = await prisma.message.count();

    // Get recent students (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStudents = await prisma.user.count({
      where: {
        role: 'STUDENT',
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      totalStudents,
      totalChats,
      totalMaterials,
      totalMessages,
      recentStudents,
    };
  }
}
