-- ============================================
-- 002 SECURITY HARDENING (2026-11-05)
-- Run in the Supabase SQL Editor AFTER 001_create_bookings.sql.
-- Safe to run more than once.
--
-- What 001 allowed, and what this changes:
--   * SELECT ... TO anon USING (true)   -> anyone with the public anon key could
--     download every client's name, email, phone and session notes.
--     Now only admins can read bookings. The booking form asks for taken slots
--     through get_booked_slots(), which returns time slots only.
--   * INSERT ... TO anon WITH CHECK (true) -> anyone could insert a booking
--     with status 'confirmed' or any amount. Public bookings now go through
--     create_booking(), which validates the input, forces
--     status = 'pending_payment' and amount = 150000, and applies abuse limits.
--   * UPDATE/DELETE ... TO authenticated -> anyone who signed up through
--     Supabase Auth counted as "admin". Admin is now an explicit allow-list
--     (public.admin_users), checked by public.is_admin().
--
-- AFTER RUNNING, add yourself as admin (use the email you sign in with):
--
--   insert into public.admin_users (user_id, note)
--   select id, 'owner' from auth.users where email = 'you@example.com'
--   on conflict (user_id) do nothing;
--
-- Also: Authentication -> Sign In / Providers -> turn OFF "Allow new users to
-- sign up" (admins are added from the dashboard), and turn on CAPTCHA if you can.
-- ============================================

begin;

-- 1. Admin allow-list ----------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

-- No policies on purpose: the list is managed from the SQL editor only.
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2. Bookings: admin-only table access -----------------------------------

drop policy if exists "Anyone can create a booking" on public.bookings;
drop policy if exists "Anyone can read bookings" on public.bookings;
drop policy if exists "Admin can update bookings" on public.bookings;
drop policy if exists "Admin can delete bookings" on public.bookings;

drop policy if exists "Admins can read bookings" on public.bookings;
drop policy if exists "Admins can update bookings" on public.bookings;
drop policy if exists "Admins can delete bookings" on public.bookings;

alter table public.bookings enable row level security;

create policy "Admins can read bookings"
  on public.bookings for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update bookings"
  on public.bookings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete bookings"
  on public.bookings for delete
  to authenticated
  using ((select public.is_admin()));

-- The public site no longer touches the table directly. (The Edge Functions
-- use the service role, which is not affected.)
revoke all on public.bookings from anon;
revoke insert, truncate, references, trigger on public.bookings from authenticated;

-- 3. Public slot availability (no client details) ------------------------

create or replace function public.get_booked_slots(p_date date)
returns table (time_slot text)
language sql
stable
security definer
set search_path = ''
as $$
  select b.time_slot::text
  from public.bookings b
  where b.booking_date = p_date
    and b.status in ('confirmed', 'pending_payment');
$$;

revoke all on function public.get_booked_slots(date) from public;
grant execute on function public.get_booked_slots(date) to anon, authenticated;

-- 4. Public booking creation ---------------------------------------------

-- Per-IP attempt log for create_booking(). Stores a hash, never the IP, and
-- keeps one day of rows.
create table if not exists public.booking_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_booking_attempts_ip_time
  on public.booking_attempts (ip_hash, created_at);

alter table public.booking_attempts enable row level security;
revoke all on public.booking_attempts from anon, authenticated;

create or replace function public.create_booking(
  p_date date,
  p_time text,
  p_name text,
  p_email text,
  p_phone text,
  p_notes text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  -- The site's only session price, in centavos (P1,500). Matches Services.jsx.
  c_amount constant integer := 150000;
  c_slots constant text[] := array['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  v_today date := (now() at time zone 'Asia/Manila')::date;
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := btrim(coalesce(p_email, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  v_headers json;
  v_ip text;
  v_ip_hash text;
  v_id uuid;
begin
  -- Input checks. The form already limits these; this stops direct API calls.
  if p_time is null or not (p_time = any (c_slots)) then
    raise exception 'Please pick one of the listed time slots.';
  end if;
  -- The form offers the next 14 days except Sundays. One day of slack either
  -- side for visitors whose browser is in another time zone.
  if p_date is null or p_date < v_today or p_date > v_today + 15
     or extract(isodow from p_date) = 7 then
    raise exception 'Please pick a date from the calendar.';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'Please enter your name.';
  end if;
  if char_length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Please enter a valid email address.';
  end if;
  if char_length(v_phone) < 7 or char_length(v_phone) > 30 or v_phone !~ '^[0-9+(). -]+$' then
    raise exception 'Please enter a valid phone number.';
  end if;
  if v_notes is not null and char_length(v_notes) > 2000 then
    raise exception 'Please keep your notes under 2,000 characters.';
  end if;

  -- Abuse limits. Every unpaid booking holds a slot until an admin cancels
  -- it, so these stop one person or script from blocking the calendar.

  -- a) The same email or phone can hold at most 3 unpaid upcoming bookings.
  if (
    select count(*)
    from public.bookings b
    where b.status = 'pending_payment'
      and b.booking_date >= v_today
      and (lower(b.client_email) = lower(v_email) or b.client_phone = v_phone)
  ) >= 3 then
    raise exception 'You already have unpaid bookings. Please complete payment for one of them or contact us.';
  end if;

  -- b) At most 5 bookings per hour from one IP address. PostgREST passes the
  --    request headers in; skipped when they are not available.
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := nullif(btrim(coalesce(
    v_headers ->> 'cf-connecting-ip',
    split_part(v_headers ->> 'x-forwarded-for', ',', 1),
    v_headers ->> 'x-real-ip',
    ''
  )), '');
  if v_ip is not null then
    v_ip_hash := encode(sha256(convert_to('bestyouversion:' || v_ip, 'UTF8')), 'hex');
    delete from public.booking_attempts where created_at < now() - interval '1 day';
    if (
      select count(*)
      from public.booking_attempts a
      where a.ip_hash = v_ip_hash
        and a.created_at > now() - interval '1 hour'
    ) >= 5 then
      raise exception 'Too many booking attempts. Please try again later or contact us.';
    end if;
    insert into public.booking_attempts (ip_hash) values (v_ip_hash);
  end if;

  -- c) Site-wide: at most 20 new bookings per hour.
  if (
    select count(*) from public.bookings b
    where b.created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'We are receiving a lot of bookings right now. Please try again in a little while or contact us.';
  end if;

  begin
    insert into public.bookings (
      booking_date, time_slot, client_name, client_email, client_phone,
      notes, status, amount
    )
    values (
      p_date, p_time, v_name, v_email, v_phone,
      v_notes, 'pending_payment', c_amount
    )
    returning id into v_id;
  exception when unique_violation then
    raise exception 'Sorry, that time slot was just taken. Please pick another one.';
  end;

  return v_id;
end;
$$;

revoke all on function public.create_booking(date, text, text, text, text, text) from public;
grant execute on function public.create_booking(date, text, text, text, text, text) to anon, authenticated;

commit;
