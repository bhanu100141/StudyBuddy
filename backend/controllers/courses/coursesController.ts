import { prisma } from '@/backend/lib/prisma';

export class CoursesController {
  static async createCourse(
    userId: string,
    data: {
      name: string;
      code?: string;
      instructor?: string;
      color?: string;
      credits?: number;
      semester?: string;
      description?: string;
    }
  ) {
    const course = await prisma.course.create({
      data: {
        userId,
        ...data,
      },
    });

    return { course };
  }

  static async listCourses(userId: string) {
    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { schedules: true },
        },
      },
    });

    return { courses };
  }

  static async getCourse(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        schedules: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.userId !== userId) {
      throw new Error('Forbidden');
    }

    return { course };
  }

  static async updateCourse(
    userId: string,
    courseId: string,
    data: {
      name?: string;
      code?: string;
      instructor?: string;
      color?: string;
      credits?: number;
      semester?: string;
      description?: string;
    }
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.userId !== userId) {
      throw new Error('Forbidden');
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { course: updatedCourse };
  }

  static async deleteCourse(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.userId !== userId) {
      throw new Error('Forbidden');
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: 'Course deleted successfully' };
  }
}
