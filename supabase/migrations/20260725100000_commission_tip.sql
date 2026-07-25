-- Optional tip on commissions (same currency as price).

alter table public.commissions
  add column if not exists tip numeric(10, 2);

alter table public.commissions
  drop constraint if exists commissions_tip_nonnegative;

alter table public.commissions
  add constraint commissions_tip_nonnegative
  check (tip is null or tip >= 0);
