import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetPodsByTD() {
  const tdId = "7e355351-99f8-4946-b277-2027d16a326d"; // faithcashsolutions@gmail.com
  
  console.log("🧪 Testing getPodsByTD function...\n");
  console.log(`TD ID: ${tdId}\n`);
  
  const { data, error } = await supabase
    .from("pods")
    .select("*")
    .eq("td_id", tdId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error("❌ Error:", error);
    return;
  }
  
  console.log(`✅ Found ${data?.length || 0} pods:\n`);
  data?.forEach((pod, i) => {
    console.log(`${i + 1}. ${pod.pod_name}`);
    console.log(`   ID: ${pod.id}`);
    console.log(`   TD ID: ${pod.td_id}`);
    console.log(`   Status: ${pod.status}`);
    console.log();
  });
  
  if (!data || data.length === 0) {
    console.log("⚠️  No pods returned - this is why the dashboard shows nothing!");
  } else {
    console.log(`✅ API should return ${data.length} pods`);
  }
}

testGetPodsByTD().catch(console.error);
