import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUserId, requireCOO } from '@/lib/server/auth';
import { db } from '@/lib/server/db';
import { affiliateCodes } from 'shared/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await requireCOO(req, res);
    const userId = getSessionUserId(req);
    const codes = await db.select().from(affiliateCodes).where(affiliateCodes.affiliateId.eq(userId));
    res.json(codes);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch codes' });
  }
}
