-- Prefer PHP as the default commission currency.
alter table public.commissions
  alter column currency set default 'PHP';
