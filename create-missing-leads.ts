import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createMissingLeads() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://yzcnavucvwgmulcxgxvw.supabase.co';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('🔍 Finding parents with encounters but no leads...\n');

    // Get all encounters
    const { data: encounters } = await supabase
      .from('encounters')
      .select('id, affiliate_id, parent_email, parent_name');

    console.log(`Found ${encounters?.length || 0} encounters\n`);

    for (const encounter of encounters || []) {
      // Find user by email
      const { data: user } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('email', encounter.parent_email)
        .eq('role', 'parent')
        .maybeSingle();

      if (!user) {
        console.log(`⚠️  No user found for ${encounter.parent_email}`);
        continue;
      }

      // Check if lead already exists
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('parent_id', user.id)
        .maybeSingle();

      if (existingLead) {
        console.log(`✓ Lead already exists for ${user.name}`);
        continue;
      }

      // Create lead
      const { error } = await supabase
        .from('leads')
        .insert({
          affiliate_id: encounter.affiliate_id,
          parent_id: user.id,
          encounter_id: encounter.id,
        });

      if (error) {
        console.error(`❌ Error creating lead for ${user.name}:`, error.message);
      } else {
        console.log(`✅ Created lead for ${user.name} (from encounter)`);
      }
    }

    // Now handle Mendy - she needs a lead from whoever referred her
    console.log('\n📝 Handling Mendy (parent-to-parent referral)...\n');
    
    const { data: mendy } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', 'Mendy@gmail.com')
      .maybeSingle();

    if (!mendy) {
      console.log('⚠️  Mendy not found');
    } else {
      // Check if lead exists
      const { data: mendyLead } = await supabase
        .from('leads')
        .select('id')
        .eq('parent_id', mendy.id)
        .maybeSingle();

      if (mendyLead) {
        console.log('✓ Lead already exists for Mendy');
      } else {
        console.log('Mendy was referred by either Jake or Zamo.');
        console.log('Which affiliate code did Mendy use to sign up?');
        
        // Show affiliate codes
        const { data: codes } = await supabase
          .from('affiliate_codes')
          .select('code, users!affiliate_codes_affiliate_id_fkey(name)');

        console.log('\nAvailable affiliate codes:');
        codes?.forEach((c: any, i: number) => {
          console.log(`  ${i + 1}. ${c.code} (${c.users.name})`);
        });

        const choice = await question('\nEnter the number of the affiliate: ');
        const selectedCode = codes?.[parseInt(choice) - 1];

        if (!selectedCode) {
          console.log('Invalid choice');
        } else {
          const { data: affiliateCode } = await supabase
            .from('affiliate_codes')
            .select('affiliate_id')
            .eq('code', selectedCode.code)
            .maybeSingle();

          if (affiliateCode) {
            const { error } = await supabase
              .from('leads')
              .insert({
                affiliate_id: affiliateCode.affiliate_id,
                parent_id: mendy.id,
                encounter_id: null, // Parent-to-parent referral, no direct encounter
              });

            if (error) {
              console.error('❌ Error creating lead for Mendy:', error.message);
            } else {
              console.log(`✅ Created lead for Mendy (referred by ${selectedCode.users.name})`);
            }
          }
        }
      }
    }

    rl.close();
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
  }
}

createMissingLeads();
