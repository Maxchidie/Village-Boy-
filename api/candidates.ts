
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  officeId: z.string(),
  state: z.string().optional(),
  lga: z.string().optional(),
  ward: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { officeId, state, lga, ward } = parsed.data;

  try {
    const office = await prisma.office.findUnique({ where: { id: officeId } });
    if (!office) return res.status(404).json({ error: 'Office not found' });

    const where: any = { officeId };

    if (office.scope === 'STATE') {
      where.state = state;
    } else if (office.scope === 'LGA') {
      where.state = state;
      where.lga = lga;
    } else if (office.scope === 'WARD') {
      where.state = state;
      where.lga = lga;
      where.ward = ward;
    }

    const candidates = await prisma.candidate.findMany({ where });
    return res.status(200).json(candidates);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch candidates' });
  }
}
