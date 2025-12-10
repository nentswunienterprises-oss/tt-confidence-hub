import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { email, password } = req.body;

  try {
    // 1️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      options: {
        data: { role: selectedRole },
      },
    });

    if (authError) throw authError;

    // 2️⃣ Insert into public.users
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({ id: authData.user.id, email: authData.user.email, role: "selectedRole" });

    if (insertError) throw insertError;

    // 3️⃣ Respond
    res.status(200).json({ success: true, user: authData.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
