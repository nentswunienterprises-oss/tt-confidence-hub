import webpush from "web-push";
import { storage } from "./storage";

type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

let webPushConfigured = false;

function ensureWebPushConfigured() {
  if (webPushConfigured) return;

  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("WEB_PUSH_VAPID_PUBLIC_KEY and WEB_PUSH_VAPID_PRIVATE_KEY must both be configured");
  }

  webpush.setVapidDetails(
    process.env.WEB_PUSH_SUBJECT || "mailto:support@territorialtutoring.co.za",
    publicKey,
    privateKey,
  );

  webPushConfigured = true;
}

export function getWebPushPublicKey() {
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("WEB_PUSH_VAPID_PUBLIC_KEY is not configured");
  }

  return publicKey;
}

export function isWebPushAvailable() {
  return !!process.env.WEB_PUSH_VAPID_PUBLIC_KEY && !!process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
}

export async function sendWebPushToUser(userId: string, payload: PushPayload) {
  if (!isWebPushAvailable()) {
    console.warn("[web-push] VAPID keys are not configured. Skipping push send.", { userId, tag: payload.tag });
    return { sent: 0, skipped: true as const };
  }

  ensureWebPushConfigured();
  const subscriptions = await storage.getPushSubscriptionsByUser(userId);
  if (subscriptions.length === 0) {
    return { sent: 0, skipped: false as const };
  }

  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime ?? null,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey,
            },
          },
          JSON.stringify(payload),
        );
        sent += 1;
      } catch (error: any) {
        const statusCode = error?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          try {
            await storage.deletePushSubscriptionByEndpoint(subscription.endpoint);
          } catch (cleanupError) {
            console.error("[web-push] Failed to remove stale subscription:", cleanupError);
          }
          return;
        }

        console.error("[web-push] Failed to send push notification:", error);
      }
    }),
  );

  return { sent, skipped: false as const };
}
