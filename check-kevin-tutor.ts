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

async function checkKevinTutor() {
  console.log('📊 Checking Kevin\'s tutor assignment...\n');

  // Find Kevin by ID
  const kevinId = 'ad79c26c-2685-4ae1-9413-56f8905ebf9c';
  
  const { data: kevin } = await supabase
    .from('students')
    .select('*')
    .eq('id', kevinId)
    .single();

  if (!kevin) {
    console.log('❌ Kevin not found with ID:', kevinId);
    return;
  }

  console.log('✅ Found Kevin:');
  console.log('   ID:', kevin.id);
  console.log('   Name:', kevin.name);
  console.log('   Tutor ID:', kevin.tutor_id);
  
  // Get tutor info
  if (kevin.tutor_id) {
    const { data: tutor } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', kevin.tutor_id)
      .single();
    
    if (tutor) {
      console.log('\n👨‍🏫 Assigned Tutor:');
      console.log('   ID:', tutor.id);
      console.log('   Name:', tutor.name);
      console.log('   Email:', tutor.email);
      console.log('   Role:', tutor.role);
    } else {
      console.log('\n⚠️  Tutor ID exists but user not found');
    }
  } else {
    console.log('\n⚠️  Kevin has no tutor assigned!');
  }
  
  // Check all tutors
  const { data: allTutors } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'tutor');
  
  console.log('\n📋 All Tutors in System:');
  allTutors?.forEach(t => {
    console.log(`   - ${t.name} (${t.email}) - ID: ${t.id}`);
  });
}

checkKevinTutor();
