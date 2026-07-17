alter table public.commissions add column queue_order int;

with ranked as (
  select id, row_number() over (partition by artist_id order by created_at) as rn
  from public.commissions
)
update public.commissions c
set queue_order = ranked.rn
from ranked
where c.id = ranked.id;
;
