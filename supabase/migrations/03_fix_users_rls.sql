-- Run this SQL in Supabase Dashboard > SQL Editor to fix RLS policies for users table
-- This fixes issues with "User tidak ditemukan di database" error

-- Drop existing policies on users table (to recreate them)
drop policy if exists "Users can view own profile" on users;
drop policy if exists "Users can update own profile" on users;

-- Create fixed policies that work with service_role
-- Service role key bypasses RLS automatically, these policies allow admin access

-- Admin/service role can view all users (using service_role key bypasses RLS anyway)
create policy if not exists "Admin can view all users"
  on users for select
  using (auth.jwt() ->> 'role' = 'admin' or auth.role() = 'service_role');

-- Admin can update users  
create policy if not exists "Admin can update users"
  on users for update
  using (auth.jwt() ->> 'role' = 'admin' or auth.role() = 'service_role');

-- Note: Service role automatically bypasses RLS, so INSERT will work without explicit policy
-- Just make sure SUPABASE_SERVICE_ROLE_KEY is set in Netlify environment variables