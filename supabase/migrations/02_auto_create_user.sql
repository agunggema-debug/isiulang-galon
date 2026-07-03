-- Alternative: Create a function that can be called after signUp
-- Since we cannot directly trigger on auth.users, we use a different approach

-- Create a function to insert user profile
create or replace function public.create_user_profile(
  user_id uuid,
  email text,
  name text,
  user_role text,
  phone text,
  address text
)
returns void as $$
begin
  insert into public.users (
    id,
    email,
    name,
    role,
    phone,
    address
  ) values (
    user_id,
    email,
    name,
    user_role,
    phone,
    address
  )
  on conflict (email) do nothing;
end;
$$ language plpgsql security definer;

-- Grant execute permission
grant execute on function public.create_user_profile to anon;
grant execute on function public.create_user_profile to authenticated;

-- Note: For production, you may want to:
-- 1. Use Supabase Edge Functions to sync auth.users to users table
-- 2. Or manually insert user data after signUp via API