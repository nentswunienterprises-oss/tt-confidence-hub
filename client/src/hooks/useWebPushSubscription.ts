import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";

type PushSupportState = {
  supported: boolean;
  subscribed: boolean;
  resolved: boolean;
  permission: NotificationPermission | "unsupported";
  loading: boolean;
  enable: () => Promise<void>;
  error: string | null;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

async function authorizedFetch(url: string, init?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers || {});
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(`${API_URL}${url}`, {
    ...init,
    headers,
    credentials: "include",
  });
}

export function useWebPushSubscription(enabled: boolean): PushSupportState {
  const supported = useMemo(
    () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window,
    [],
  );
  const [subscribed, setSubscribed] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    supported ? Notification.permission : "unsupported",
  );

  const syncExistingSubscription = useCallback(async () => {
    if (!enabled || !supported) {
      setResolved(true);
      return;
    }

    if (Notification.permission !== "granted") {
      setSubscribed(false);
      setResolved(true);
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      setSubscribed(false);
      setResolved(true);
      return;
    }

    const subscriptionJson = subscription.toJSON();
    await authorizedFetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscriptionJson }),
    });
    setSubscribed(true);
    setResolved(true);
  }, [enabled, supported]);

  useEffect(() => {
    setPermission(supported ? Notification.permission : "unsupported");
  }, [supported]);

  useEffect(() => {
    if (!enabled || !supported) return;

    syncExistingSubscription().catch((syncError) => {
      console.error("Failed to sync browser push subscription:", syncError);
      setError("Could not connect browser notifications.");
      setResolved(true);
    });
  }, [enabled, supported, syncExistingSubscription]);

  const enable = useCallback(async () => {
    if (!enabled || !supported) return;

    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      let nextPermission = Notification.permission;

      if (nextPermission !== "granted") {
        nextPermission = await Notification.requestPermission();
        setPermission(nextPermission);
      }

      if (nextPermission !== "granted") {
        setSubscribed(false);
        setResolved(true);
        setError(nextPermission === "denied"
          ? "Notifications are blocked in this browser. Enable them in browser settings."
          : "Notification permission was not granted.");
        return;
      }

      const keyResponse = await authorizedFetch("/api/push/vapid-public-key");
      if (!keyResponse.ok) {
        const message = await keyResponse.text();
        throw new Error(message || "Failed to load push key");
      }

      const { publicKey } = await keyResponse.json();
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const saveResponse = await authorizedFetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (!saveResponse.ok) {
        const message = await saveResponse.text();
        throw new Error(message || "Failed to save browser subscription");
      }

      setPermission("granted");
      setSubscribed(true);
      setResolved(true);
    } catch (enableError: any) {
      console.error("Failed to enable browser push:", enableError);
      setError(enableError?.message || "Could not enable browser notifications.");
      setResolved(true);
    } finally {
      setLoading(false);
    }
  }, [enabled, supported]);

  return {
    supported,
    subscribed,
    resolved,
    permission,
    loading,
    enable,
    error,
  };
}
