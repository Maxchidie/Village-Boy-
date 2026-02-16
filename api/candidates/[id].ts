
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: String(id) }
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    return res.status(200).json(candidate);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
