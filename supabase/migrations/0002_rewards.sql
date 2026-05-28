-- Ventura Rewards — schema (Phase 1)
--
-- ⚠️  This migration runs against the SHARED live Overlook agency Supabase
--     project (ref qpejcptvicvhlidcznkz). It is ADDITIVE ONLY and touches
--     exclusively `rewards_*` tables and `vf_*` functions. Do NOT alter,
--     drop, or reference any non-rewards table here.
--
-- Safe to re-run: every object is guarded with `if not exists` /
-- `create or replace`.
--
-- Access model:
--   * All `rewards_*` tables have RLS enabled with NO policies, so only the
--     service_role key (used in Next.js API routes) can read/write them.
--   * Point mutations go exclusively through the `vf_*` SECURITY DEFINER
--     functions below, which are revoked from PUBLIC and granted only to
--     service_role.
--   * QR "Scan to Earn" uses Model B: the member's app shows a short-lived
--     signed token; the vendor dashboard scans it and awards points. The
--     token's nonce is stored in rewards_transactions.qr_nonce to block
--     replays.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'rewards_txn_type') then
    create type rewards_txn_type as enum ('earn', 'redeem', 'adjust');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists rewards_vendors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  slug        text not null unique,
  category    text not null check (category in ('food', 'fitness', 'lodging', 'cafe')),
  address     text,
  latitude    numeric,
  longitude   numeric,
  logo_url    text,
  active      boolean not null default true
);

create table if not exists rewards_catalog (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  vendor_id    uuid not null references rewards_vendors(id) on delete cascade,
  title        text not null,
  description  text,
  points_cost  integer not null check (points_cost > 0),
  active       boolean not null default true
);

create table if not exists rewards_members (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  device_id      text not null unique,
  email          text,
  phone          text,
  points_balance integer not null default 0 check (points_balance >= 0)
);

create table if not exists rewards_transactions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  member_id       uuid not null references rewards_members(id) on delete cascade,
  vendor_id       uuid references rewards_vendors(id) on delete set null,
  catalog_item_id uuid references rewards_catalog(id) on delete set null,
  type            rewards_txn_type not null,
  points          integer not null,        -- signed: + earn, - redeem
  qr_nonce        text unique,             -- replay guard for earn scans (NULL for redeem/adjust)
  source          text,
  redemption_code text,
  created_by      uuid                     -- auth.uid() of the vendor/admin who recorded it, if any
);

-- Maps Supabase Auth users to the vendor(s) they can operate (dashboard auth).
create table if not exists rewards_vendor_users (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid not null,               -- references auth.users(id)
  vendor_id   uuid not null references rewards_vendors(id) on delete cascade,
  role        text not null default 'staff' check (role in ('staff', 'manager', 'admin')),
  unique (user_id, vendor_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists rewards_catalog_vendor_idx        on rewards_catalog (vendor_id);
create index if not exists rewards_transactions_member_idx   on rewards_transactions (member_id, created_at desc);
create index if not exists rewards_transactions_vendor_idx   on rewards_transactions (vendor_id, created_at desc);
create index if not exists rewards_vendor_users_user_idx     on rewards_vendor_users (user_id);

-- ---------------------------------------------------------------------------
-- RLS — service-role only (no policies = no anon/authenticated access)
-- ---------------------------------------------------------------------------
alter table rewards_vendors        enable row level security;
alter table rewards_catalog        enable row level security;
alter table rewards_members        enable row level security;
alter table rewards_transactions   enable row level security;
alter table rewards_vendor_users   enable row level security;

-- ---------------------------------------------------------------------------
-- Functions — point mutations (SECURITY DEFINER, service_role only)
-- ---------------------------------------------------------------------------

-- Award points to a member. Idempotent per nonce: a repeated scan with the
-- same qr_nonce raises `duplicate_nonce` instead of double-crediting.
create or replace function vf_rewards_earn(
  p_member_id  uuid,
  p_vendor_id  uuid,
  p_points     integer,
  p_nonce      text default null,
  p_source     text default 'qr_scan',
  p_created_by uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_points <= 0 then
    raise exception 'points_must_be_positive';
  end if;

  -- Lock the member row (also validates existence).
  perform 1 from rewards_members where id = p_member_id for update;
  if not found then
    raise exception 'member_not_found';
  end if;

  begin
    insert into rewards_transactions (member_id, vendor_id, type, points, qr_nonce, source, created_by)
    values (p_member_id, p_vendor_id, 'earn', p_points, p_nonce, p_source, p_created_by);
  exception when unique_violation then
    raise exception 'duplicate_nonce';
  end;

  update rewards_members
     set points_balance = points_balance + p_points
   where id = p_member_id
  returning points_balance into v_balance;

  return v_balance;
end;
$$;

-- Redeem a catalog item. Locks the member row to prevent double-spend and
-- rejects if the balance is insufficient. Returns the new balance and a
-- short redemption code for the vendor to honor.
create or replace function vf_rewards_redeem(
  p_member_id       uuid,
  p_catalog_item_id uuid,
  p_created_by      uuid default null
)
returns table (new_balance integer, redemption_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_cost    integer;
  v_vendor  uuid;
  v_code    text;
begin
  -- Lock the member row first to serialize concurrent redemptions.
  select points_balance into v_balance
    from rewards_members where id = p_member_id for update;
  if not found then
    raise exception 'member_not_found';
  end if;

  select points_cost, vendor_id into v_cost, v_vendor
    from rewards_catalog where id = p_catalog_item_id and active = true;
  if not found then
    raise exception 'catalog_item_not_found';
  end if;

  if v_balance < v_cost then
    raise exception 'insufficient_points';
  end if;

  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into rewards_transactions
    (member_id, vendor_id, catalog_item_id, type, points, source, redemption_code, created_by)
  values
    (p_member_id, v_vendor, p_catalog_item_id, 'redeem', -v_cost, 'redeem', v_code, p_created_by);

  update rewards_members
     set points_balance = points_balance - v_cost
   where id = p_member_id
  returning points_balance into v_balance;

  return query select v_balance, v_code;
end;
$$;

-- Manual balance correction (agency/admin). Negative values are allowed but
-- the rewards_members check constraint prevents the balance going below zero.
create or replace function vf_rewards_adjust(
  p_member_id  uuid,
  p_points     integer,
  p_reason     text default 'manual_adjustment',
  p_created_by uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  perform 1 from rewards_members where id = p_member_id for update;
  if not found then
    raise exception 'member_not_found';
  end if;

  insert into rewards_transactions (member_id, type, points, source, created_by)
  values (p_member_id, 'adjust', p_points, p_reason, p_created_by);

  update rewards_members
     set points_balance = points_balance + p_points
   where id = p_member_id
  returning points_balance into v_balance;

  return v_balance;
end;
$$;

-- Lock the functions down to service_role only.
revoke all on function vf_rewards_earn(uuid, uuid, integer, text, text, uuid)   from public;
revoke all on function vf_rewards_redeem(uuid, uuid, uuid)                       from public;
revoke all on function vf_rewards_adjust(uuid, integer, text, uuid)             from public;

grant execute on function vf_rewards_earn(uuid, uuid, integer, text, text, uuid) to service_role;
grant execute on function vf_rewards_redeem(uuid, uuid, uuid)                    to service_role;
grant execute on function vf_rewards_adjust(uuid, integer, text, uuid)          to service_role;
