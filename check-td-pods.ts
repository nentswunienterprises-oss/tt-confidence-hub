import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error("❌ SUPABASE_ANON_KEY not found in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTDPods() {
  console.log("🔍 Checking TD assignments...\n");
  
  // Find Thendo's user record
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("*")
    .ilike("email", "%thendo%");
  
  if (userError) {
    console.error("❌ Error fetching users:", userError);
    return;
  }
  
  console.log("👤 Found users matching 'thendo':");
  users?.forEach(user => {
    console.log(`   - ${user.name} (${user.email}) - ID: ${user.id} - Role: ${user.role}`);
  });
  
  if (!users || users.length === 0) {
    console.log("\n❌ No users found matching 'thendo'");
    return;
  }
  
  const thendo = users[0];
  console.log(`\n🎯 Checking pods for: ${thendo.name} (${thendo.id})\n`);
  
  // Check all pods
  const { data: allPods, error: allPodsError } = await supabase
    .from("pods")
    .select("*")
    .is("deleted_at", null);
  
  if (allPodsError) {
    console.error("❌ Error fetching all pods:", allPodsError);
    return;
  }
  
  console.log("📦 All active pods in database:");
  allPods?.forEach(pod => {
    console.log(`   - ${pod.pod_name} (ID: ${pod.id})`);
    console.log(`     TD ID: ${pod.td_id || '(none)'}`);
    console.log(`     Status: ${pod.status}, Phase: ${pod.phase}`);
    console.log();
  });
  
  // Check pods assigned to Thendo
  const { data: thendoPods, error: thendoPodsError } = await supabase
    .from("pods")
    .select("*")
    .eq("td_id", thendo.id)
    .is("deleted_at", null);
  
  if (thendoPodsError) {
    console.error("❌ Error fetching Thendo's pods:", thendoPodsError);
    return;
  }
  
  console.log(`\n✅ Pods assigned to ${thendo.name}:`);
  if (thendoPods && thendoPods.length > 0) {
    thendoPods.forEach(pod => {
      console.log(`   ✓ ${pod.pod_name} (${pod.id})`);
    });
  } else {
    console.log("   ❌ No pods assigned!");
  }
  
  console.log(`\n📊 Total pods assigned: ${thendoPods?.length || 0}`);
  
  // Check who the actual TD is
  const actualTdId = allPods && allPods.length > 0 ? allPods[0].td_id : null;
  if (actualTdId) {
    const { data: actualTD } = await supabase
      .from("users")
      .select("*")
      .eq("id", actualTdId)
      .single();
    
    console.log(`\n🔍 Actual TD assigned to the pods:`);
    if (actualTD) {
      console.log(`   - ${actualTD.name} (${actualTD.email})`);
      console.log(`   - ID: ${actualTD.id}`);
      console.log(`   - Role: ${actualTD.role}`);
    } else {
      console.log(`   - TD ID ${actualTdId} not found in users table!`);
    }
  }
  
  console.log(`\n💡 TO FIX: Either`);
  console.log(`   1. Change Thendo's role from 'tutor' to 'td'`);
  console.log(`   2. Reassign the pods to Thendo by updating their td_id`);
}

checkTDPods().catch(console.error);
