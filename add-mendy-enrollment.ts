import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

async function addMendyEnrollment() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('📝 Looking up Mendy Hones in users table...');
    
    // Find Mendy's user record
    const { data: mendyUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .or("name.ilike.%Mendy%,email.ilike.%mendy%")
      .single();

    if (userError || !mendyUser) {
      console.error('❌ Could not find Mendy:', userError?.message);
      
      // Try searching in auth.users as backup
      console.log('Trying to search by name containing "Mendy"...');
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('id, email, name, role')
        .limit(10);
      
      if (allError) {
        console.error('Error fetching users:', allError);
        return;
      }
      
      console.log('Available users:');
      allUsers?.forEach(u => console.log(`  - ${u.name || 'no name'} (${u.email}) - Role: ${u.role}`));
      return;
    }

    console.log('✅ Found Mendy:', {
      id: mendyUser.id,
      name: mendyUser.name,
      email: mendyUser.email,
      role: mendyUser.role
    });

    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabase
      .from('parent_enrollments')
      .select('*')
      .eq('user_id', mendyUser.id)
      .maybeSingle();

    if (existingEnrollment) {
      console.log('✅ Enrollment already exists:', existingEnrollment);
      return;
    }

    // Create enrollment record for Mendy
    const { data: enrollment, error: enrollError } = await supabase
      .from('parent_enrollments')
      .insert({
        user_id: mendyUser.id,
        parent_full_name: mendyUser.name || 'Mendy Hones',
        parent_phone: '555-1234',
        parent_email: mendyUser.email,
        parent_city: 'Unknown',
        student_full_name: 'Kevin',
        student_grade: '4th Grade',
        school_name: 'Unknown School',
        math_struggle_areas: 'To be determined',
        previous_tutoring: 'No',
        confidence_level: 'Medium',
        internet_access: 'Yes',
        parent_motivation: 'Wants to improve math skills',
        status: 'awaiting_assignment',
      })
      .select();

    if (enrollError) {
      console.error('❌ Error creating enrollment:', enrollError.message);
      return;
    }

    console.log('✅ Enrollment created successfully:', enrollment);

    // Verify it was saved
    const { data: verify } = await supabase
      .from('parent_enrollments')
      .select('*')
      .eq('user_id', mendyUser.id)
      .single();

    console.log('✅ Verified enrollment in database:', verify);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addMendyEnrollment();
