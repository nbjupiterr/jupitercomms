alter table public.commissions drop constraint if exists commissions_status_check;

update public.commissions set status = case
  when status in ('inquiry','awaiting_payment','paused','revision') then 'queued'
  when status in ('client_review') then 'in_progress'
  when status in ('cancelled') then 'completed'
  else status
end
where status not in ('waitlisted','queued','in_progress','completed');

alter table public.commissions
  add constraint commissions_status_check
  check (status in ('waitlisted','queued','in_progress','completed'));
;
