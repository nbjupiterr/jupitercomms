-- Turnaround time (TAT) for FCFS estimated delivery dates.
alter table public.artist_profiles
  add column if not exists tat_min_days int,
  add column if not exists tat_max_days int;

alter table public.artist_profiles
  drop constraint if exists artist_profiles_tat_days_check;

alter table public.artist_profiles
  add constraint artist_profiles_tat_days_check
  check (
    (tat_min_days is null and tat_max_days is null)
    or (
      tat_min_days is not null
      and tat_max_days is not null
      and tat_min_days >= 1
      and tat_max_days >= tat_min_days
    )
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
  tat_max_days int
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
    tat_max_days
  from public.artist_profiles
  where public_queue_token = p_token;
$$;

grant execute on function public.get_public_artist(text) to anon, authenticated;
