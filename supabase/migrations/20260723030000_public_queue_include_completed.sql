drop function if exists public.get_public_queue(text);

create function public.get_public_queue(p_token text)
returns table (
  client_name text,
  status text,
  progress_percentage int,
  stage_name text,
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
  visible as (
    select
      c.client_name,
      c.status,
      c.progress_percentage,
      ws.name as stage_name,
      row_number() over (
        order by
          case c.status
            when 'in_progress' then 0
            when 'queued' then 1
            when 'waitlisted' then 2
            when 'completed' then 3
            else 4
          end,
          c.queue_order asc nulls last,
          c.created_at asc
      ) as queue_position
    from public.commissions c
    join artist a on c.artist_id = a.user_id
    left join public.workflow_stages ws on ws.id = c.workflow_stage_id
    where c.status in ('waitlisted','queued','in_progress','completed')
  )
  select
    visible.client_name,
    visible.status,
    visible.progress_percentage,
    visible.stage_name,
    visible.queue_position,
    visible.status = 'in_progress' as is_current,
    (select display_name from artist) as artist_name
  from visible
  order by visible.queue_position;
$$;

grant execute on function public.get_public_queue(text) to anon, authenticated;
