import { supabase } from "./supabaseClient";
import { API_URL } from "./config";

export async function authorizedGetJson(path: string): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
    console.log("🔐 authorizedGetJson: using Supabase token");
  } else {
    console.warn("⚠️ authorizedGetJson: no Supabase token, relying on cookies");
  }

  const fullUrl = API_URL + path;
  console.log("🔗 authorizedGetJson: GET", fullUrl);

  const res = await fetch(fullUrl, {
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Invalid content-type: ${contentType}. Body: ${text.substring(0, 200)}`);
  }

  return res.json();
}
