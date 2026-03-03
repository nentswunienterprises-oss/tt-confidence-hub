import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUserId, requireCOO } from '@/lib/server/auth';
import { db } from '@/lib/server/db';
import { affiliateCodes } from 'shared/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await requireCOO(req, res);
    const userId = getSessionUserId(req);
    const { type, personName, entityName, schoolType } = req.body;
    const code = 'AFIX' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await db.insert(affiliateCodes).values({
      code,
      type,
      personName,
      entityName,
      schoolType,
      affiliateId: userId,
    });
    res.json({ code });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create affiliate code' });
  }
}
