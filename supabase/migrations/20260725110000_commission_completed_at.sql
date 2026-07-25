-- Track when a commission was marked complete (for client-facing "Completed …" date).

alter table public.commissions
  add column if not exists completed_at timestamptz;

-- Backfill existing completed rows from last update time.
update public.commissions
set completed_at = coalesce(updated_at, created_at)
where status = 'completed'
  and completed_at is null;

create or replace function public.set_commission_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed'
     and (tg_op = 'INSERT' or old.status is distinct from 'completed') then
    new.completed_at := coalesce(new.completed_at, now());
  elsif new.status is distinct from 'completed' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_commission_completed_at on public.commissions;
create trigger trg_set_commission_completed_at
  before insert or update of status on public.commissions
  for each row
  execute function public.set_commission_completed_at();

-- Public queue: expose completed_at for finished cards.
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
  deadline date,
  completed_at timestamptz
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
      c.completed_at,
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
    visible.deadline,
    visible.completed_at
  from visible
  order by visible.sort_key;
$$;

grant execute on function public.get_public_queue(text) to anon, authenticated;
