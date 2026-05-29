-- Ventura Rewards — vendor + catalog seed (OPTIONAL)
--
-- ⚠️  Seeds the SHARED live agency DB. Run deliberately, and only when you
--     want these vendors to appear in live mode. Idempotent: re-running does
--     not create duplicates (vendors keyed by slug, one catalog item per
--     vendor by existence check).
--
-- Mirrors src/data/mock-partners.ts so the Rewards tab shows the same set of
-- partners in live mode that it does in demo mode.

insert into rewards_vendors (name, slug, category, address, logo_url) values
  ('Pizza Chief',                     'pizza-chief',             'food',    '1138 E Thompson Blvd, Ventura, CA 93001', '/logos/pizza-chief.png'),
  ('Spencer Makenzie''s Fish Company','spencer-makenzies',       'food',    '806 E Thompson Blvd, Ventura, CA 93001',  null),
  ('Corrales Mexican Food',           'corrales-mexican-food',   'food',    '795 E Thompson Blvd, Ventura, CA 93001',  '/logos/corrales-mexican-food.png'),
  ('Lure Fish House',                 'lure-fish-house',         'food',    '60 S California St, Ventura, CA 93001',   null),
  ('Cafe Zack',                       'cafe-zack',               'cafe',    '1095 E Thompson Blvd, Ventura, CA 93001', null),
  ('Marshall''s Bodacious BBQ',       'marshalls-bodacious-bbq', 'food',    '1105 S Seaward Ave, Ventura, CA 93001',   '/logos/marshalls-bodacious-bbq.png'),
  ('Hotworx Ventura',                 'hotworx-ventura',         'fitness', '1788 E Main St, Ventura, CA 93001',        '/logos/hotworx-ventura.png'),
  ('Pete''s Coffee',                  'petes-coffee',            'cafe',    '5720 Telephone Rd, Ventura, CA 93003',    null)
on conflict (slug) do nothing;

-- One catalog perk per vendor (guarded so re-runs don't duplicate).
insert into rewards_catalog (vendor_id, title, points_cost)
select v.id, perk.title, perk.points_cost
from (values
  ('pizza-chief',             'One large cheese pizza',                350),
  ('spencer-makenzies',       '25% off one meal bundle',              1200),
  ('corrales-mexican-food',   '$12 meal credit',                       300),
  ('lure-fish-house',         'Free side + drink with seafood entree', 280),
  ('cafe-zack',               'Coffee and pastry combo',               220),
  ('marshalls-bodacious-bbq', 'Two-sandwich combo upgrade',            400),
  ('hotworx-ventura',         'One free training session',             500),
  ('petes-coffee',            'Any medium handcrafted drink',          200)
) as perk(slug, title, points_cost)
join rewards_vendors v on v.slug = perk.slug
where not exists (
  select 1 from rewards_catalog c where c.vendor_id = v.id
);
