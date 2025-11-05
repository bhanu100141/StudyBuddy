import { prisma } from '@/backend/lib/prisma';

export class SchedulesController {
  static async createSchedule(
    userId: string,
    data: {
      title: string;
      description?: string;
      type?: 'CLASS' | 'ASSIGNMENT' | 'EXAM' | 'TASK' | 'OTHER';
      date: string; // ISO date string
      startTime?: string;
      endTime?: string;
      location?: string;
      courseId?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    }
  ) {
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        type: data.type || 'OTHER',
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        courseId: data.courseId,
        priority: data.priority || 'MEDIUM',
      },
      include: {
        course: true,
      },
    });

    return { schedule };
  }

  static async listSchedules(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      courseId?: string;
      type?: string;
    }
  ) {
    const where: any = { userId };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        course: true,
      },
    });

    return { schedules };
  }

  static async getSchedule(userId: string, scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        course: true,
      },
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.userId !== userId) {
      throw new Error('Forbidden');
    }

    return { schedule };
  }

  static async updateSchedule(
    userId: string,
    scheduleId: string,
    data: {
      title?: string;
      description?: string;
      type?: 'CLASS' | 'ASSIGNMENT' | 'EXAM' | 'TASK' | 'OTHER';
      date?: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      courseId?: string;
      isCompleted?: boolean;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    }
  ) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.userId !== userId) {
      throw new Error('Forbidden');
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    updateData.updatedAt = new Date();

    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        course: true,
      },
    });

    return { schedule: updatedSchedule };
  }

  static async deleteSchedule(userId: string, scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.userId !== userId) {
      throw new Error('Forbidden');
    }

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    return { message: 'Schedule deleted successfully' };
  }

  static async toggleComplete(userId: string, scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.userId !== userId) {
      throw new Error('Forbidden');
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        isCompleted: !schedule.isCompleted,
        updatedAt: new Date(),
      },
      include: {
        course: true,
      },
    });

    return { schedule: updatedSchedule };
  }
}
