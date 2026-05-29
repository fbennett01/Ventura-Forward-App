-- Ventura Rewards — analytics (Phase 6)
--
-- Read-only SECURITY DEFINER functions the (separate-repo) Ventura Forward
-- dashboard calls over the SHARED DB with the service-role key. Additive,
-- safe to re-run. Touches only rewards_* data.

-- Program-wide totals (single row).
create or replace function vf_rewards_stats()
returns table (
  members_total         bigint,
  points_outstanding    bigint,
  points_earned_total   bigint,
  points_redeemed_total bigint,
  redemptions_total     bigint,
  active_vendors        bigint,
  txns_last_7d          bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from rewards_members),
    (select coalesce(sum(points_balance), 0) from rewards_members),
    (select coalesce(sum(points), 0)  from rewards_transactions where type = 'earn'),
    (select coalesce(-sum(points), 0) from rewards_transactions where type = 'redeem'),
    (select count(*) from rewards_transactions where type = 'redeem'),
    (select count(*) from rewards_vendors where active),
    (select count(*) from rewards_transactions where created_at >= now() - interval '7 days');
$$;

-- Per-vendor leaderboard, busiest first.
create or replace function vf_rewards_vendor_leaderboard(p_limit integer default 20)
returns table (
  vendor_id       uuid,
  vendor_name     text,
  points_earned   bigint,
  points_redeemed bigint,
  redemptions     bigint
)
language sql
security definer
set search_path = public
as $$
  select
    v.id,
    v.name,
    coalesce(sum(t.points) filter (where t.type = 'earn'), 0),
    coalesce(-sum(t.points) filter (where t.type = 'redeem'), 0),
    count(*) filter (where t.type = 'redeem')
  from rewards_vendors v
  left join rewards_transactions t on t.vendor_id = v.id
  group by v.id, v.name
  order by coalesce(sum(t.points) filter (where t.type = 'earn'), 0) desc
  limit greatest(p_limit, 1);
$$;

-- Daily earned/redeemed for the last N days (zero-filled).
create or replace function vf_rewards_daily(p_days integer default 30)
returns table (
  day             date,
  points_earned   bigint,
  points_redeemed bigint,
  txns            bigint
)
language sql
security definer
set search_path = public
as $$
  select
    d::date,
    coalesce(sum(t.points) filter (where t.type = 'earn'), 0),
    coalesce(-sum(t.points) filter (where t.type = 'redeem'), 0),
    count(t.id)
  from generate_series(
    current_date - (greatest(p_days, 1) - 1),
    current_date,
    interval '1 day'
  ) as d
  left join rewards_transactions t on t.created_at::date = d::date
  group by d
  order by d;
$$;

revoke all on function vf_rewards_stats()                       from public;
revoke all on function vf_rewards_vendor_leaderboard(integer)   from public;
revoke all on function vf_rewards_daily(integer)                from public;

grant execute on function vf_rewards_stats()                     to service_role;
grant execute on function vf_rewards_vendor_leaderboard(integer) to service_role;
grant execute on function vf_rewards_daily(integer)              to service_role;
