drop function if exists public.get_public_queue(text);

create function public.get_public_queue(p_token text)
returns table (
  client_name text,
  status text,
  progress_percentage int,
  queue_position bigint,
  is_current boolean,
  artist_name text
)
language sql
security definer
set search_path = public
stable
as $$
  with artist as (
    select user_id, coalesce(display_name, 'Artist') as display_name
    from public.artist_profiles
    where public_queue_token = p_token
  ),
  active as (
    select
      c.client_name,
      c.status,
      c.progress_percentage,
      row_number() over (order by c.queue_order asc nulls last, c.created_at asc) as queue_position
    from public.commissions c, artist a
    where c.artist_id = a.user_id
      and c.status in ('queued','in_progress','client_review','revision')
  )
  select
    active.client_name,
    active.status,
    active.progress_percentage,
    active.queue_position,
    active.status = 'in_progress' as is_current,
    (select display_name from artist) as artist_name
  from active
  order by active.queue_position;
$$;

grant execute on function public.get_public_queue(text) to anon, authenticated;
;
