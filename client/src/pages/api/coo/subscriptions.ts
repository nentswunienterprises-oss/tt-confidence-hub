import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUserId, requireCOO } from '@/lib/server/auth';
import { db } from '@/lib/server/db';
import { closes, users, futureExpansionFields } from 'shared/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await requireCOO(req, res);
    const userId = getSessionUserId(req);
    // Get subscriptions (payments) for codes created by this COO
    const result = await db.select({
      id: closes.id,
      parentName: users.name,
      userEmail: users.email,
      paymentStatus: futureExpansionFields.stripePaymentStatus,
    })
      .from(closes)
      .innerJoin(users, users.id.eq(closes.parentId))
      .leftJoin(futureExpansionFields, futureExpansionFields.affiliateId.eq(closes.affiliateId))
      .where(closes.affiliateId.eq(userId));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch subscriptions' });
  }
}
