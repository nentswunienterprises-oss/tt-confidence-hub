import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ message: "Affiliate code is required" }), { status: 400 });
    }
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }
    // Call backend API to set affiliate code
    const res = await fetch("/api/auth/set-affiliate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return new Response(JSON.stringify({ message: data.message || "Failed to update code" }), { status: 400 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: err.message || "Unknown error" }), { status: 500 });
  }
}
