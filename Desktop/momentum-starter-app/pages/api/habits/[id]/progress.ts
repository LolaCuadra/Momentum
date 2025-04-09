import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const { id } = req.query;

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (req.method === 'POST') {
    const { date, completed } = req.body;
    try {
      const progress = await prisma.habitProgress.upsert({
        where: {
          habitId_date: {
            habitId: id as string,
            date: new Date(date),
          },
        },
        update: { completed },
        create: {
          habitId: id as string,
          date: new Date(date),
          completed,
        },
      });
      return res.status(200).json(progress);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to mark progress' });
    }
  }
  return res.status(405).end();
}