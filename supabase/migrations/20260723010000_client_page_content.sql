-- Client page content: TOS, price table, contact email, gallery, socials

alter table public.artist_profiles
  add column if not exists tos_markdown text,
  add column if not exists contact_email text,
  add column if not exists price_table jsonb not null default '{"columns":["Type","Price"],"rows":[]}'::jsonb;

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_items_artist_sort_idx
  on public.gallery_items (artist_id, sort_order);

alter table public.gallery_items enable row level security;

create policy "Artists manage own gallery"
  on public.gallery_items
  for all
  using (artist_id = auth.uid())
  with check (artist_id = auth.uid());

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists social_links_artist_sort_idx
  on public.social_links (artist_id, sort_order);

alter table public.social_links enable row level security;

create policy "Artists manage own social links"
  on public.social_links
  for all
  using (artist_id = auth.uid())
  with check (artist_id = auth.uid());

-- Public gallery bucket (path: {user_id}/{filename})
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Artists upload own gallery"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Artists update own gallery"
  on storage.objects for update
  using (
    bucket_id = 'gallery'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Artists delete own gallery"
  on storage.objects for delete
  using (
    bucket_id = 'gallery'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop function if exists public.get_public_artist(text);

create function public.get_public_artist(p_token text)
returns table (
  artist_name text,
  availability_status text,
  available_slots int,
  availability_message text,
  tos_markdown text,
  contact_email text,
  price_table jsonb
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
    price_table
  from public.artist_profiles
  where public_queue_token = p_token;
$$;

grant execute on function public.get_public_artist(text) to anon, authenticated;

create or replace function public.get_public_gallery(p_token text)
returns table (
  id uuid,
  storage_path text,
  caption text,
  sort_order int
)
language sql
security definer
set search_path = public
stable
as $$
  select g.id, g.storage_path, g.caption, g.sort_order
  from public.gallery_items g
  join public.artist_profiles a on a.user_id = g.artist_id
  where a.public_queue_token = p_token
  order by g.sort_order asc, g.created_at asc;
$$;

grant execute on function public.get_public_gallery(text) to anon, authenticated;

create or replace function public.get_public_socials(p_token text)
returns table (
  id uuid,
  platform text,
  url text,
  sort_order int
)
language sql
security definer
set search_path = public
stable
as $$
  select s.id, s.platform, s.url, s.sort_order
  from public.social_links s
  join public.artist_profiles a on a.user_id = s.artist_id
  where a.public_queue_token = p_token
  order by s.sort_order asc, s.created_at asc;
$$;

grant execute on function public.get_public_socials(text) to anon, authenticated;
