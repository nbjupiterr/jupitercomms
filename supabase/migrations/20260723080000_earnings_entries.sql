-- Persistent earnings ledger (survives commission deletion from the queue).
create table if not exists public.earnings_entries (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references auth.users (id) on delete cascade,
  commission_id uuid unique references public.commissions (id) on delete set null,
  title text not null,
  client_name text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'PHP',
  kind text not null check (kind in ('pending', 'completed')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists earnings_entries_artist_occurred_idx
  on public.earnings_entries (artist_id, occurred_at desc);

alter table public.earnings_entries enable row level security;

create policy "Artists manage own earnings"
  on public.earnings_entries
  for all
  using (auth.uid() = artist_id)
  with check (auth.uid() = artist_id);

-- Backfill from current priced commissions still in the queue.
insert into public.earnings_entries (
  artist_id,
  commission_id,
  title,
  client_name,
  amount,
  currency,
  kind,
  occurred_at
)
select
  c.artist_id,
  c.id,
  c.title,
  c.client_name,
  c.price,
  coalesce(nullif(c.currency, ''), 'PHP'),
  case when c.status = 'completed' then 'completed' else 'pending' end,
  case
    when c.status = 'completed' then coalesce(c.updated_at, c.created_at)
    else c.created_at
  end
from public.commissions c
where c.price is not null
  and c.status in ('completed', 'queued', 'in_progress')
on conflict (commission_id) do nothing;
