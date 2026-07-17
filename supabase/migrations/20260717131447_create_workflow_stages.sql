create table public.workflow_stages (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  sort_order int not null,
  threshold_percentage int not null check (threshold_percentage between 0 and 100),
  created_at timestamptz not null default now(),
  unique (artist_id, sort_order)
);

alter table public.workflow_stages enable row level security;

create policy "Artists manage own workflow stages"
  on public.workflow_stages
  for all
  using (artist_id = auth.uid())
  with check (artist_id = auth.uid());

create index workflow_stages_artist_id_idx on public.workflow_stages (artist_id);

-- Link commissions to a workflow stage; progress_percentage is derived from the stage's threshold.
alter table public.commissions
  add column workflow_stage_id uuid references public.workflow_stages(id) on delete set null;

create or replace function public.sync_commission_progress_from_stage()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.workflow_stage_id is not null then
    select threshold_percentage into new.progress_percentage
    from public.workflow_stages
    where id = new.workflow_stage_id;
  end if;
  return new;
end;
$$;

create trigger commissions_sync_progress_from_stage
  before insert or update of workflow_stage_id on public.commissions
  for each row
  execute function public.sync_commission_progress_from_stage();
;
