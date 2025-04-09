import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid habit ID' });
  }

  try {
    if (req.method === 'PUT') {
      const { name, description, frequency, startDate, remind, category } = req.body;
      const updated = await prisma.habit.update({
        where: { id },
        data: {
          name,
          description,
          frequency,
          startDate: new Date(startDate),
          remind,
          category,
        },
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await prisma.habit.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Habit Update/Delete Error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}