-- Stronger public queue tokens (128-bit) + protect against weak rewrites.
-- Batch deadline updates to avoid N+1 client writes.

create extension if not exists pgcrypto with schema extensions;

alter table public.artist_profiles
  alter column public_queue_token
  set default encode(extensions.gen_random_bytes(16), 'hex');

update public.artist_profiles
set public_queue_token = encode(extensions.gen_random_bytes(16), 'hex')
where char_length(public_queue_token) < 32
   or public_queue_token !~ '^[0-9a-f]+$';

alter table public.artist_profiles
  drop constraint if exists artist_profiles_public_queue_token_format;

alter table public.artist_profiles
  add constraint artist_profiles_public_queue_token_format
  check (
    char_length(public_queue_token) >= 32
    and public_queue_token ~ '^[0-9a-f]+$'
  );

create or replace function public.protect_public_queue_token()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
     and new.public_queue_token is distinct from old.public_queue_token then
    if char_length(new.public_queue_token) < 32
       or new.public_queue_token !~ '^[0-9a-f]+$' then
      raise exception 'public_queue_token must be a 32+ hex string';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_public_queue_token on public.artist_profiles;
create trigger trg_protect_public_queue_token
  before update of public_queue_token on public.artist_profiles
  for each row
  execute function public.protect_public_queue_token();

create or replace function public.regenerate_public_queue_token()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_token text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  new_token := encode(extensions.gen_random_bytes(16), 'hex');

  update public.artist_profiles
  set public_queue_token = new_token
  where user_id = auth.uid();

  if not found then
    raise exception 'artist profile not found';
  end if;

  return new_token;
end;
$$;

revoke all on function public.regenerate_public_queue_token() from public;
grant execute on function public.regenerate_public_queue_token() to authenticated;

create or replace function public.sync_commission_deadlines(p_updates jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.commissions c
  set deadline = nullif(u->>'deadline', '')::date
  from jsonb_array_elements(coalesce(p_updates, '[]'::jsonb)) as u
  where c.id = (u->>'id')::uuid
    and c.artist_id = auth.uid();
end;
$$;

revoke all on function public.sync_commission_deadlines(jsonb) from public;
grant execute on function public.sync_commission_deadlines(jsonb) to authenticated;
