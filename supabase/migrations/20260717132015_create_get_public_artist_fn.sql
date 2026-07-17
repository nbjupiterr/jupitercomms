create or replace function public.get_public_artist(p_token text)
returns table (
  artist_name text,
  availability_status text,
  available_slots int,
  availability_message text
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
    availability_message
  from public.artist_profiles
  where public_queue_token = p_token;
$$;

grant execute on function public.get_public_artist(text) to anon, authenticated;
;
