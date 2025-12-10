import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkKevinIdentity() {
  console.log('📊 Checking Kevin\'s identity sheet...\n');

  // Find Kevin
  const { data: kevin } = await supabase
    .from('students')
    .select('*')
    .ilike('name', '%kevin%')
    .single();

  if (!kevin) {
    console.log('❌ Kevin not found');
    return;
  }

  console.log('✅ Found Kevin:');
  console.log('   ID:', kevin.id);
  console.log('   Name:', kevin.name);
  console.log('   Tutor ID:', kevin.tutor_id);
  console.log('\n📋 Identity Sheet Data:');
  console.log('   personalProfile:', kevin.personal_profile ? 'EXISTS' : 'NULL');
  console.log('   emotionalInsights:', kevin.emotional_insights ? 'EXISTS' : 'NULL');
  console.log('   academicDiagnosis:', kevin.academic_diagnosis ? 'EXISTS' : 'NULL');
  console.log('   identitySheet:', kevin.identity_sheet ? 'EXISTS' : 'NULL');
  console.log('   completedAt:', kevin.identity_sheet_completed_at);
  
  if (kevin.personal_profile) {
    console.log('\n📝 Personal Profile:', JSON.stringify(kevin.personal_profile, null, 2));
  }
  
  if (kevin.emotional_insights) {
    console.log('\n💭 Emotional Insights:', JSON.stringify(kevin.emotional_insights, null, 2));
  }
  
  if (kevin.academic_diagnosis) {
    console.log('\n📚 Academic Diagnosis:', JSON.stringify(kevin.academic_diagnosis, null, 2));
  }
  
  if (kevin.identity_sheet) {
    console.log('\n🎯 Identity Sheet:', JSON.stringify(kevin.identity_sheet, null, 2));
  }
}

checkKevinIdentity();
