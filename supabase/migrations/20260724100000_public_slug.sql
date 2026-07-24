-- Claimable public username slug for client links (/u/slug).
-- Token URLs remain valid; slug resolves to public_queue_token.

alter table public.artist_profiles
  add column if not exists public_slug text;

create unique index if not exists artist_profiles_public_slug_key
  on public.artist_profiles (public_slug)
  where public_slug is not null;

alter table public.artist_profiles
  drop constraint if exists artist_profiles_public_slug_format;

alter table public.artist_profiles
  add constraint artist_profiles_public_slug_format
  check (
    public_slug is null
    or (
      char_length(public_slug) between 3 and 30
      and public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    )
  );

alter table public.artist_profiles
  drop constraint if exists artist_profiles_public_slug_reserved;

alter table public.artist_profiles
  add constraint artist_profiles_public_slug_reserved
  check (
    public_slug is null
    or public_slug not in (
      'u',
      'queue',
      'dashboard',
      'login',
      'signup',
      'forgot-password',
      'api',
      'settings',
      'admin',
      'orbit',
      'jupiter',
      'auth',
      'assets',
      'public',
      'hub',
      'earnings',
      'workflow',
      'availability',
      'commissions',
      'www'
    )
  );

create or replace function public.resolve_public_slug(p_slug text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select public_queue_token
  from public.artist_profiles
  where public_slug = lower(trim(p_slug))
  limit 1;
$$;

revoke all on function public.resolve_public_slug(text) from public;
grant execute on function public.resolve_public_slug(text) to anon, authenticated;
