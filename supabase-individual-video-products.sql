-- Run this once in the Supabase SQL editor for the legitbodyfix project.
--
-- Why: entitlements.program_id is a free-standing text/uuid identifier, and
-- the "My library" page (and /api/access/library) join entitlements ->
-- programs(id,title,price,currency,active) to know what to show. Buying a
-- single video creates an entitlement row with program_id = that video's id
-- (e.g. "neck-alignment"), so a matching row must exist here or the purchase
-- will be recorded but silently invisible to the buyer.
--
-- Prices below match assets/data/videos.json as of 2026-07-30. If you change
-- a price in videos.json, update the matching row here too — both places
-- must agree or PayPal/entitlement validation will reject the payment.

insert into programs (id, title, price, currency, active)
values
  ('neck-alignment',          'Neck Alignment',          12, 'USD', true),
  ('ankle-sprain-rehabilitation', 'Ankle Sprain Rehabilitation', 14, 'USD', true),
  -- Keep the former identifier active so any earlier entitlement remains visible.
  ('shoulder-reset',          'Ankle Sprain Rehabilitation (legacy)', 14, 'USD', true),
  ('pelvic-balance',          'Pelvic Balance',          15, 'USD', true),
  ('foot-mechanics',          'Foot Mechanics',          10, 'USD', true),
  ('walking-mechanics',       'Walking Mechanics',       16, 'USD', true),
  ('breathing-fundamentals',  'Breathing Fundamentals',   8, 'USD', true)
on conflict (id) do update
  set title = excluded.title,
      price = excluded.price,
      currency = excluded.currency,
      active = excluded.active;
