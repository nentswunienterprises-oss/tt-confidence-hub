import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUserId, requireCOO } from '@/lib/server/auth';
import { db } from '@/lib/server/db';
import { leads, users } from 'shared/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await requireCOO(req, res);
    const userId = getSessionUserId(req);
    // Get leads for codes created by this COO
    const result = await db.select({
      id: leads.id,
      parentName: db.raw(`CONCAT(${users.firstName}, ' ', ${users.lastName})`),
      userEmail: users.email,
      status: leads.trackingSource,
    })
      .from(leads)
      .innerJoin(users, users.id.eq(leads.userId))
      .where(leads.affiliateId.eq(userId));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch leads' });
  }
}
