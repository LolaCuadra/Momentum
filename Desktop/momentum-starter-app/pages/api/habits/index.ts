import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    if (req.method === 'GET') {
      const habits = await prisma.habit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          progress: true,
        },
      });

      const today = new Date();
      const todayDateStr = today.toISOString().split('T')[0];

      const habitsWithStreaks = habits.map((habit) => {
        const sortedProgress = habit.progress
          .filter(p => p.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let streak = 0;
        let prevDate = new Date(todayDateStr);

        for (const p of sortedProgress) {
          const progressDate = new Date(p.date);
          if (prevDate.toDateString() === progressDate.toDateString()) {
            streak++;
          } else if (
            prevDate.toDateString() === new Date(progressDate.getTime() + 86400000).toDateString()
          ) {
            streak++;
            prevDate = progressDate;
          } else {
            break;
          }
        }

        return { ...habit, streak };
      });

      return res.status(200).json(habitsWithStreaks);
    }

    if (req.method === 'POST') {
      const { name, description, frequency, startDate, remind, category } = req.body;
      const newHabit = await prisma.habit.create({
        data: {
          name,
          description,
          frequency,
          startDate: new Date(startDate),
          remind,
          category,
          userId,
        },
      });
      return res.status(201).json(newHabit);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}