-- Multi price tables + configurable kanban columns

alter table public.artist_profiles
  add column if not exists price_tables jsonb not null default '[]'::jsonb,
  add column if not exists kanban_columns jsonb not null default '[]'::jsonb;

-- Seed price_tables from legacy columns when empty
update public.artist_profiles p
set price_tables = (
  select jsonb_agg(entry)
  from (
    select jsonb_build_object(
      'id', 'prices',
      'title', 'Prices',
      'columns', coalesce(p.price_table->'columns', '["Type","Price"]'::jsonb),
      'rows', coalesce(p.price_table->'rows', '[]'::jsonb)
    ) as entry
    union all
    select jsonb_build_object(
      'id', 'additionals',
      'title', 'Additionals',
      'columns', coalesce(p.additionals_table->'columns', '["Additional","Price"]'::jsonb),
      'rows', coalesce(p.additionals_table->'rows', '[]'::jsonb)
    )
    where coalesce(jsonb_array_length(p.additionals_table->'rows'), 0) > 0
  ) x
)
where p.price_tables = '[]'::jsonb;

update public.artist_profiles
set price_tables = jsonb_build_array(
  jsonb_build_object(
    'id', 'prices',
    'title', 'Prices',
    'columns', '["Type","Price"]'::jsonb,
    'rows', '[]'::jsonb
  )
)
where price_tables = '[]'::jsonb or price_tables is null;

update public.artist_profiles
set kanban_columns = '[
  {"id":"waitlisted","key":"waitlisted","label":"Waitlist","sort_order":0},
  {"id":"queued","key":"queued","label":"In Queue","sort_order":1},
  {"id":"in_progress","key":"in_progress","label":"In Progress","sort_order":2},
  {"id":"completed","key":"completed","label":"Completed","sort_order":3}
]'::jsonb
where kanban_columns = '[]'::jsonb or kanban_columns is null;

alter table public.commissions drop constraint if exists commissions_status_check;

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
  kanban_columns jsonb
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
    kanban_columns
  from public.artist_profiles
  where public_queue_token = p_token;
$$;

grant execute on function public.get_public_artist(text) to anon, authenticated;

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
      ) as queue_position
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
    (select display_name from artist) as artist_name
  from visible
  order by visible.queue_position;
$$;

grant execute on function public.get_public_queue(text) to anon, authenticated;
