-- Username (public_slug) can be claimed once and never changed or cleared.

create or replace function public.protect_public_slug()
returns trigger
language plpgsql
as $$
begin
  if old.public_slug is not null
     and new.public_slug is distinct from old.public_slug then
    raise exception 'public_slug can only be set once';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_public_slug on public.artist_profiles;
create trigger trg_protect_public_slug
  before update of public_slug on public.artist_profiles
  for each row
  execute function public.protect_public_slug();
