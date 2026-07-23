-- Slot capacity thresholds for auto availability.
-- available_slots = total open commission slots (capacity).
alter table public.artist_profiles
  add column if not exists limited_threshold int,
  add column if not exists waitlist_capacity int,
  add column if not exists availability_override text;

alter table public.artist_profiles
  drop constraint if exists artist_profiles_limited_threshold_check;
alter table public.artist_profiles
  add constraint artist_profiles_limited_threshold_check
  check (limited_threshold is null or limited_threshold >= 0);

alter table public.artist_profiles
  drop constraint if exists artist_profiles_waitlist_capacity_check;
alter table public.artist_profiles
  add constraint artist_profiles_waitlist_capacity_check
  check (waitlist_capacity is null or waitlist_capacity >= 0);

alter table public.artist_profiles
  drop constraint if exists artist_profiles_availability_override_check;
alter table public.artist_profiles
  add constraint artist_profiles_availability_override_check
  check (
    availability_override is null
    or availability_override in ('closed', 'unavailable')
  );

drop function if exists public.get_public_artist(text);

create function public.get_public_artist(p_token text)
returns table (
  artist_name text,
  availability_status text,
  available_slots int,
  availability_message text,
  tos_markdown text,
  contact_email text,
  price_table jsonb,
  additionals_table jsonb,
  price_tables jsonb,
  kanban_columns jsonb,
  tat_min_days int,
  tat_max_days int,
  limited_threshold int,
  waitlist_capacity int,
  availability_override text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(display_name, 'Artist'),
    availability_status,
    available_slots,
    availability_message,
    tos_markdown,
    contact_email,
    price_table,
    additionals_table,
    price_tables,
    kanban_columns,
    tat_min_days,
    tat_max_days,
    limited_threshold,
    waitlist_capacity,
    availability_override
  from public.artist_profiles
  where public_queue_token = p_token;
$$;

grant execute on function public.get_public_artist(text) to anon, authenticated;
