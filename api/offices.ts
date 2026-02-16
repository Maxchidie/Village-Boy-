
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const offices = await prisma.office.findMany({
      orderBy: { id: 'asc' }
    });
    return res.status(200).json(offices);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch offices' });
  }
}
