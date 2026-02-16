import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse } from 'cookie';
import { prisma } from './_lib/prisma';
import { z } from 'zod';

const prefSchema = z.object({
  officeId: z.string(),
  candidateId: z.string(),
  reasons: z.array(z.string()).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cookies = parse(req.headers.cookie || '');
  const sessionId = cookies.vb_session;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized: Session missing' });

  const user = await prisma.user.findUnique({ where: { sessionId } });
  if (!user) return res.status(401).json({ error: 'User not found' });

  const parsed = prefSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { officeId, candidateId, reasons } = parsed.data;

  try {
    const pref = await prisma.preference.upsert({
      where: {
        userId_officeId: {
          userId: user.id,
          officeId,
        }
      },
      update: {
        candidateId,
        reasonsJson: JSON.stringify(reasons || []),
      },
      create: {
        userId: user.id,
        officeId,
        candidateId,
        reasonsJson: JSON.stringify(reasons || []),
      }
    });

    // Return object compatible with the frontend Preference type
    return res.status(200).json({
      ...pref,
      reasons: JSON.parse(pref.reasonsJson || '[]')
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save preference' });
  }
}
