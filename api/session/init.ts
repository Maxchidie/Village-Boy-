
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { serialize } from 'cookie';
import { prisma } from '../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let sessionId = req.cookies.vb_session;
  let user = null;

  if (sessionId) {
    user = await prisma.user.findUnique({ where: { sessionId } });
  }

  if (!sessionId || !user) {
    sessionId = uuidv4();
    res.setHeader('Set-Cookie', serialize('vb_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    }));
  }

  return res.status(200).json({ ok: true, sessionId });
}
