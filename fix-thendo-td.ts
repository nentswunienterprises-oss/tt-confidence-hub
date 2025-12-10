import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixThendoAccount() {
  const thendonentswniId = "b69c8eb7-a6e7-41c2-acda-61ebd75908dc";
  const podIds = [
    "406ab7d6-9e21-44b7-b3a8-f632e94e3194", // Pod#1
    "d766d45d-0409-4557-a904-527e57872c2d", // Pod #2
    "7619b6ca-fc73-419e-be4a-b18291404fff"  // Pod #3
  ];
  
  console.log("🔧 Fixing Thendo's account...\n");
  
  // Option 1: Update Thendo's role to TD
  console.log("1️⃣  Updating thendonentswni@gmail.com role to 'td'...");
  const { error: roleError } = await supabase
    .from("users")
    .update({ role: "td" })
    .eq("id", thendonentswniId);
  
  if (roleError) {
    console.error("❌ Error updating role:", roleError);
    return;
  }
  console.log("✅ Role updated successfully");
  
  // Option 2: Reassign all 3 pods to the correct Thendo account
  console.log("\n2️⃣  Reassigning all 3 pods to thendonentswni@gmail.com...");
  for (const podId of podIds) {
    const { error: podError } = await supabase
      .from("pods")
      .update({ td_id: thendonentswniId })
      .eq("id", podId);
    
    if (podError) {
      console.error(`❌ Error updating pod ${podId}:`, podError);
    } else {
      console.log(`✅ Pod ${podId} reassigned`);
    }
  }
  
  console.log("\n✅ All done! Thendo should now see all 3 pods.");
  console.log("🔄 Please refresh the browser to see the changes.");
}

fixThendoAccount().catch(console.error);
