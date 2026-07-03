-- Create a trigger function to sync auth.users to our users table
-- This function will be called when a new user signs up

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, phone, address)
  values (
    gen_random_uuid(),
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce((new.raw_user_meta_data->>'role')::text, 'retail'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'address', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Note: If you want to use numeric IDs from our users table, you might need to adjust
-- Alternatively, you can use auth.users.id (UUID) as the primary key in users table
-- For now, we use gen_random_uuid() for simplicity

-- Grant execute permission
grant execute on function public.handle_new_user to anon;
grant execute on function public.handle_new_user to authenticated;