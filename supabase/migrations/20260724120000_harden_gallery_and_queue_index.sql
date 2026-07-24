-- Keep gallery bucket public for CDN URLs, but stop anon listing/enumeration.
-- Public object URLs still work without a SELECT policy on storage.objects.

drop policy if exists "Public read gallery" on storage.objects;

drop policy if exists "Artists read own gallery" on storage.objects;
create policy "Artists read own gallery"
  on storage.objects for select
  using (
    bucket_id = 'gallery'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Speed up queue board ordering.
create index if not exists commissions_artist_queue_order_idx
  on public.commissions (artist_id, queue_order nulls last, created_at);
