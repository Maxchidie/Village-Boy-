
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { serialize, parse } from 'cookie';
import { prisma } from '../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cookies = parse(req.headers.cookie || '');
  let sessionId = cookies.vb_session;
  let user = null;

  try {
    if (sessionId) {
      user = await prisma.user.findUnique({ where: { sessionId } });
    }

    if (!sessionId || !user) {
      sessionId = uuidv4();
      user = await prisma.user.create({
        data: { sessionId }
      });
      res.setHeader('Set-Cookie', serialize('vb_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      }));
    }

    return res.status(200).json({ 
      ok: true, 
      sessionId,
      user: {
        id: user.id,
        state: user.state,
        lga: user.lga,
        ward: user.ward,
        standardsAccepted: user.standardsAccepted,
        onboarded: !!(user.state && user.lga)
      }
    });
  } catch (error) {
    console.error("Session Init Error:", error);
    // Fallback for database connection issues so the app still loads
    return res.status(200).json({
      ok: false,
      user: {
        id: 'offline-user',
        standardsAccepted: false,
        onboarded: false
      }
    });
  }
}
