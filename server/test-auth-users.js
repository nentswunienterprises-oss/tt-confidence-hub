import 'dotenv/config';
// Minimal test to check if Supabase JS can access auth.users
export default async function testAuthUsers(supabase) {
  try {
    const { data, error } = await supabase
      .from("auth.users")
      .select("id, email, user_metadata")
      .limit(1);
    if (error) {
      console.error("Supabase auth.users error:", error);
    } else {
      console.log("Supabase auth.users result:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}


// Run test if this file is executed directly
import { supabase } from './storage.js';
testAuthUsers(supabase);
