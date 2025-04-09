import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tasks);
  }

  if (req.method === 'POST') {
    const { title, description, dueDate } = req.body;
    const task = await prisma.task.create({
      data: { title, description, dueDate, userId },
    });
    return res.status(201).json(task);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}