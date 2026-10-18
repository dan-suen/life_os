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
  -- Per-copy upgrade stages: [{"key": "4★", "mats": {"Katana Stone": 200, ...}}, ...].
  -- Keys starting with "Awaken" are awakening stages.
  stages jsonb not null default '[]',
  -- Per-copy progress: [{"done": ["4★", "Skill"], "awaken": "Atk"}, ...].
  progress jsonb not null default '[]',
  source text not null default '',
  created_at timestamptz not null default now()
);
alter table gbf_weapons disable row level security;

-- Migrate an existing table created by the previous version of this file:
alter table gbf_weapons drop column if exists category;
alter table gbf_weapons add column if not exists stages jsonb not null default '[]';
alter table gbf_weapons add column if not exists progress jsonb not null default '[]';
-- Odious befoulment notes: {"avoid": ["HP", "C.A."]} (per-copy targets live in progress[].bf).
alter table gbf_weapons add column if not exists befoulment jsonb not null default '{}';

-- Group-specific upgrade materials (e.g. World Idean / Veritas / Gospel), kept out of
-- gbf_weapons so only the weapons that use them carry them. Amounts are per copy, per stage;
-- `stage` matches a key in gbf_weapons.stages.
create table if not exists gbf_weapon_extra_mats (
  id bigint generated always as identity primary key,
  weapon_id bigint not null references gbf_weapons(id) on delete cascade,
  stage text not null,
  material text not null,
  amount integer not null check (amount > 0),
  unique (weapon_id, stage, material)
);
alter table gbf_weapon_extra_mats disable row level security;

-- In-game stock per material for the Σ Materials tab: owned count + manual "complete" flag.
create table if not exists gbf_inventory (
  material text primary key,
  owned integer not null default 0,
  complete boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table gbf_inventory disable row level security;

-- Weapons are managed from the app UI; nothing seeds or resets these tables.
