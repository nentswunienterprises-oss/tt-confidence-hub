-- ============================================
-- SUPABASE TRIGGER: Automatically create user in public.users table
-- when a new user signs up via Supabase Auth
-- ============================================

-- Step 1: Create or replace the trigger function
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  full_name text;
  first_name_val text;
  last_name_val text;
begin
  -- Extract role from metadata, default to 'tutor' if not provided
  user_role := coalesce(new.raw_user_meta_data->>'role', 'tutor');
  
  -- Extract first and last names
  first_name_val := coalesce(new.raw_user_meta_data->>'first_name', '');
  last_name_val := coalesce(new.raw_user_meta_data->>'last_name', '');
  
  -- Build full name: "FirstName LastName" or fallback to email prefix
  full_name := trim(concat(first_name_val, ' ', last_name_val));
  if full_name is null or full_name = '' then
    full_name := split_part(new.email, '@', 1);
  end if;
  
  -- Log for debugging
  raise notice 'Creating user with trigger: email=%, role=%, full_name=%', 
    new.email, user_role, full_name;
  
  -- Insert the user
  insert into public.users (id, email, role, first_name, last_name, name)
  values (
    new.id,
    new.email,
    user_role,
    first_name_val,
    last_name_val,
    full_name
  );
  
  raise notice 'User created successfully: id=%, email=%', new.id, new.email;
  return new;
exception when others then
  raise notice 'Error creating user: error=%', sqlerrm;
  raise;
end;
$$ language plpgsql security definer;

-- Step 2: Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Step 3: Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- INSTRUCTIONS FOR USE:
-- ============================================
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 
-- This trigger will now automatically:
-- - Create a user in public.users whenever someone signs up
-- - Use the role from metadata (defaults to 'tutor' if not provided)
-- - Use first_name and last_name from metadata
-- - Generate a full name from first_name + last_name, or use email prefix
-- ============================================
