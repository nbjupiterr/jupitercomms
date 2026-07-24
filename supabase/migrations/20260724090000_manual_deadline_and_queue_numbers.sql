-- Manual deadlines only (no TAT auto-calc). Public queue numbers active work only.
-- Expose commission.deadline on the public queue.

drop function if exists public.get_public_queue(text);

create function public.get_public_queue(p_token text)
returns table (
  client_name text,
  status text,
  progress_percentage int,
  stage_name text,
  queue_position bigint,
  is_current boolean,
  artist_name text,
  deadline date
)
language sql
security definer
set search_path = public
stable
as $$
  with artist as (
    select user_id, coalesce(display_name, 'Artist') as display_name, kanban_columns
    from public.artist_profiles
    where public_queue_token = p_token
  ),
  visible as (
    select
      c.client_name,
      c.status,
      c.progress_percentage,
      ws.name as stage_name,
      c.deadline,
      -- Display order across all columns (kanban column order, then queue order)
      row_number() over (
        order by
          coalesce(
            (
              select (col->>'sort_order')::int
              from jsonb_array_elements((select kanban_columns from artist)) col
              where col->>'key' = c.status
            ),
            999
          ),
          c.queue_order asc nulls last,
          c.created_at asc
      ) as sort_key,
      -- Client-facing # only for In Progress / In Queue (FCFS among those)
      case
        when c.status in ('queued', 'in_progress') then
          row_number() over (
            partition by (c.status in ('queued', 'in_progress'))
            order by
              case c.status
                when 'in_progress' then 0
                when 'queued' then 1
                else 2
              end,
              c.queue_order asc nulls last,
              c.created_at asc
          )
        else null
      end as queue_position
    from public.commissions c
    join artist a on c.artist_id = a.user_id
    left join public.workflow_stages ws on ws.id = c.workflow_stage_id
  )
  select
    visible.client_name,
    visible.status,
    visible.progress_percentage,
    visible.stage_name,
    visible.queue_position,
    visible.status = 'in_progress' as is_current,
    (select display_name from artist) as artist_name,
    visible.deadline
  from visible
  order by visible.sort_key;
$$;

grant execute on function public.get_public_queue(text) to anon, authenticated;

-- Stop exposing unused TAT fields on the public artist payload.
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
    limited_threshold,
    waitlist_capacity,
    availability_override
  from public.artist_profiles
  where public_queue_token = p_token;
$$;

grant execute on function public.get_public_artist(text) to anon, authenticated;
