create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_name text not null,
  client_contact text,
  title text not null,
  commission_type text,
  status text not null default 'queued' check (status in ('inquiry','awaiting_payment','queued','in_progress','client_review','revision','paused','completed','cancelled')),
  description text,
  price numeric(10,2),
  currency text not null default 'USD',
  deadline date,
  progress_percentage int not null default 0 check (progress_percentage between 0 and 100),
  public_tracking_enabled boolean not null default true,
  tracking_token text unique not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commissions enable row level security;

create policy "Artists manage own commissions"
  on public.commissions
  for all
  using (artist_id = auth.uid())
  with check (artist_id = auth.uid());

create index commissions_artist_id_idx on public.commissions (artist_id);
create index commissions_status_idx on public.commissions (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger commissions_set_updated_at
  before update on public.commissions
  for each row
  execute function public.set_updated_at();
;
