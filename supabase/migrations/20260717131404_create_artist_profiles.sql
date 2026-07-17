create table public.artist_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  public_queue_token text unique not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  availability_status text not null default 'open' check (availability_status in ('open','limited','waitlist','closed','unavailable')),
  available_slots int,
  availability_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.artist_profiles enable row level security;

create policy "Artists manage own profile"
  on public.artist_profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger artist_profiles_set_updated_at
  before update on public.artist_profiles
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.artist_profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.artist_profiles (user_id, display_name)
select id, raw_user_meta_data->>'display_name' from auth.users
on conflict (user_id) do nothing;
;
