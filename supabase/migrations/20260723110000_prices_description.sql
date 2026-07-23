-- Optional blurb shown above price tables on the public client page.
alter table public.artist_profiles
  add column if not exists prices_description text;

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
  prices_description text,
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
    prices_description,
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
