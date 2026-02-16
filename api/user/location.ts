
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse } from 'cookie';
import { prisma } from '../_lib/prisma';
import { z } from 'zod';

const locationSchema = z.object({
  state: z.string(),
  lga: z.string(),
  ward: z.string().optional(),
  privacyDefault: z.boolean().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cookies = parse(req.headers.cookie || '');
  const sessionId = cookies.vb_session;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized' });

  const parsed = locationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const user = await prisma.user.update({
      where: { sessionId },
      data: parsed.data,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update location' });
  }
}
