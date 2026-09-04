-- Run this in the Supabase SQL editor for the life_os project.
--
-- GBF Grid module: weapons are organized by GROUP (where they're obtained --
-- Omega Rebirth, Odious, Exo, ...) rather than by grid tier. The old
-- `category` column (Core/Additional/Niche/...) has been dropped; `source`
-- holds the group name. Element is just a column (groups pool all elements),
-- and can be 'Any' for element-agnostic weapons (Ultima/World/Celestial/etc).
--
-- Both tables use the same no-RLS pattern as the rest of the app
-- (anon key only, no auth flow).

create table if not exists gbf_grid_checked (
  weapon_name text primary key   -- key format: "{element}:{weapon name}"
);
alter table gbf_grid_checked disable row level security;

create table if not exists gbf_weapons (
  id bigint generated always as identity primary key,
  element text not null,
  name text not null,
  rank text not null default '',
  copies text not null default '',
  source text not null default '',
  created_at timestamptz not null default now()
);
alter table gbf_weapons disable row level security;

-- Migrate an existing table created by the previous version of this file:
alter table gbf_weapons drop column if exists category;

-- Seed data is loaded separately from scripts/gbf_seed.mjs (parsed from the
-- gbf.wiki Advanced Grids pages saved under gbf/). To rebuild:
--   node scripts/gbf_seed.mjs purge
--   node scripts/gbf_seed.mjs insert supabase/gbf_weapons_seed.json
