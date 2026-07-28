import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getReportData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.params;
    const now = new Date();

    if (type === 'daily') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const tasksToday = await prisma.task.findMany({
        where: {
          startDate: { lte: endOfToday },
          endDate: { gte: startOfToday },
        },
        include: {
          room: { select: { name: true, floor: { select: { name: true } } } },
          subWork: { select: { name: true, category: { select: { name: true } } } },
          contractor: { select: { name: true } },
          supervisor: { select: { name: true } },
        },
        orderBy: { startDate: 'asc' },
      });

      const todayNotes = await prisma.note.findMany({
        where: {
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
        include: {
          createdBy: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const todayPhotos = await prisma.photo.findMany({
        where: {
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
        include: {
          uploadedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalLaborToday = tasksToday.reduce((sum: number, t: any) => sum + (t.labourCount || 1), 0);

      return res.json({
        type: 'daily',
        title: 'Daily Construction Execution Report',
        date: startOfToday.toISOString().split('T')[0],
        generatedAt: now.toISOString(),
        metrics: {
          activeTasksCount: tasksToday.length,
          totalLaborOnSite: totalLaborToday,
          notesCount: todayNotes.length,
          photosCount: todayPhotos.length,
        },
        tasks: tasksToday,
        notes: todayNotes,
        photos: todayPhotos,
      });
    }

    if (type === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weeklyTasks = await prisma.task.findMany({
        where: {
          startDate: { lte: endOfWeek },
          endDate: { gte: startOfWeek },
        },
        include: {
          room: { select: { name: true } },
          subWork: { select: { name: true, category: { select: { name: true } } } },
          contractor: { select: { name: true } },
        },
        orderBy: { startDate: 'asc' },
      });

      const delayedTasks = weeklyTasks.filter((t: any) => {
        const isPast = new Date(t.endDate) < now;
        return t.status === 'HOLD' || (isPast && t.progress < 100);
      });

      const avgProgress = weeklyTasks.length > 0
        ? Math.round(weeklyTasks.reduce((acc: number, t: any) => acc + t.progress, 0) / weeklyTasks.length)
        : 0;

      return res.json({
        type: 'weekly',
        title: 'Weekly Construction Execution Summary',
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
        generatedAt: now.toISOString(),
        metrics: {
          totalWeeklyTasks: weeklyTasks.length,
          avgProgressPercent: avgProgress,
          delayedTasksCount: delayedTasks.length,
        },
        tasks: weeklyTasks,
        delayedTasks,
      });
    }

    if (type === 'snag') {
      const allSnags = await prisma.snag.findMany({
        include: {
          room: { select: { name: true, floor: { select: { name: true } } } },
          task: { select: { name: true } },
          assignedTo: { select: { name: true, role: true } },
          createdBy: { select: { name: true } },
          photos: { select: { url: true, caption: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const openCount = allSnags.filter((s: any) => s.status === 'OPEN').length;
      const inProgressCount = allSnags.filter((s: any) => s.status === 'IN_PROGRESS').length;
      const resolvedCount = allSnags.filter((s: any) => s.status === 'RESOLVED').length;
      const closedCount = allSnags.filter((s: any) => s.status === 'CLOSED').length;

      return res.json({
        type: 'snag',
        title: 'Site Defect & Snag Inspection Report',
        generatedAt: now.toISOString(),
        metrics: {
          totalSnags: allSnags.length,
          open: openCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
        },
        snags: allSnags,
      });
    }

    if (type === 'completion') {
      const allProjects = await prisma.project.findMany({
        include: {
          floors: {
            include: {
              rooms: {
                include: {
                  tasks: true,
                  snags: true,
                },
              },
            },
          },
        },
      });

      const allTasks = await prisma.task.findMany();
      const overallProgress = allTasks.length > 0
        ? Math.round(allTasks.reduce((acc: number, t: any) => acc + t.progress, 0) / allTasks.length)
        : 0;

      const completedTasksCount = allTasks.filter((t: any) => t.status === 'COMPLETED' || t.progress >= 100).length;

      const rooms = await prisma.room.findMany({
        include: {
          floor: { select: { name: true, project: { select: { name: true } } } },
          tasks: { select: { id: true, progress: true, status: true } },
          snags: { select: { id: true, status: true } },
        },
      });

      const roomSummaries = rooms.map((r: any) => {
        const roomTasks = r.tasks;
        const avgProg = roomTasks.length > 0
          ? Math.round(roomTasks.reduce((acc: number, t: any) => acc + t.progress, 0) / roomTasks.length)
          : 0;
        const pendingSnags = r.snags.filter((s: any) => s.status === 'OPEN' || s.status === 'IN_PROGRESS').length;

        return {
          id: r.id,
          name: r.name,
          floorName: r.floor?.name,
          projectName: r.floor?.project?.name,
          taskCount: roomTasks.length,
          progress: avgProg,
          pendingSnags,
        };
      });

      return res.json({
        type: 'completion',
        title: 'Project Handover & Completion Status Report',
        generatedAt: now.toISOString(),
        metrics: {
          overallProgressPercent: overallProgress,
          totalTasks: allTasks.length,
          completedTasks: completedTasksCount,
          roomsCount: rooms.length,
        },
        projects: allProjects,
        rooms: roomSummaries,
      });
    }

    res.status(400).json({ error: 'Invalid report type requested. Valid types: daily, weekly, snag, completion' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate report dataset' });
  }
};
