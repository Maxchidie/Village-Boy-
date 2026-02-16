
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { state, lga } = req.query;
  if (!state) return res.status(400).json({ error: 'State required' });

  const offices = await prisma.office.findMany();
  const results: Record<string, any> = {};

  for (const office of offices) {
    const totalVotes = await prisma.preference.count({
      where: {
        officeId: office.id,
        user: { state: String(state) }
      }
    });

    if (totalVotes < 25) {
      results[office.id] = { allowed: false, totalVotes, officeName: office.name };
      continue;
    }

    const aggregates = await prisma.preference.groupBy({
      by: ['candidateId'],
      where: {
        officeId: office.id,
        user: { state: String(state) }
      },
      _count: { candidateId: true },
      orderBy: { _count: { candidateId: 'desc' } }
    });

    const detailedResults = await Promise.all(aggregates.map(async (agg) => {
      const cand = await prisma.candidate.findUnique({ where: { id: agg.candidateId } });
      return {
        candidateId: agg.candidateId,
        candidateName: cand?.name || 'Unknown',
        party: cand?.party || 'Unknown',
        count: agg._count.candidateId
      };
    }));

    results[office.id] = {
      allowed: true,
      totalVotes,
      officeName: office.name,
      data: detailedResults
    };
  }

  return res.status(200).json(results);
}
