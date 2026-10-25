-- =====================================================================
-- Faculty Development Portal : schema, RLS, triggers, realtime
-- Run this whole file once in Supabase Dashboard -> SQL Editor
-- =====================================================================

create type public.user_role as enum ('faculty', 'hod', 'admin');
create type public.activity_type as enum ('fdp', 'workshop', 'conference', 'certification', 'publication');
create type public.activity_status as enum ('pending', 'approved', 'rejected');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role public.user_role not null default 'faculty',
  department_id uuid references public.departments(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  title text not null,
  type public.activity_type not null default 'fdp',
  organizer text not null default '',
  start_date date not null,
  end_date date not null,
  hours integer not null check (hours > 0),
  certificate_url text,
  status public.activity_status not null default 'pending',
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint activities_dates_ok check (end_date >= start_date)
);

create index activities_faculty_idx on public.activities(faculty_id);
create index activities_department_idx on public.activities(department_id);
create index activities_status_idx on public.activities(status);

-- ---------- helper functions (security definer avoids RLS recursion) ----------
create or replace function public.auth_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.auth_dept()
returns uuid language sql stable security definer set search_path = public as $$
  select department_id from public.profiles where id = auth.uid()
$$;

-- ---------- new auth user -> profile (always starts as faculty) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, department_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'department_id', '')::uuid
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- only admins may change role / department / email ----------
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and public.auth_role() is distinct from 'admin' then
    new.role := old.role;
    new.department_id := old.department_id;
    new.email := old.email;
  end if;
  return new;
end;
$$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------- activities: force pending status + department on insert ----------
create or replace function public.prepare_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.status := 'pending';
  new.reviewer_id := null;
  new.reviewed_at := null;
  new.department_id := (select department_id from public.profiles where id = new.faculty_id);
  return new;
end;
$$;

create trigger activities_prepare
  before insert on public.activities
  for each row execute function public.prepare_activity();

-- ---------- Row Level Security ----------
alter table public.departments enable row level security;
alter table public.profiles    enable row level security;
alter table public.activities  enable row level security;

-- departments: anyone can read (needed on sign-up), only admin writes
create policy "departments readable" on public.departments for select using (true);
create policy "departments admin write" on public.departments for all
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- profiles
create policy "profiles select" on public.profiles for select using (
  id = auth.uid()
  or public.auth_role() = 'admin'
  or (public.auth_role() = 'hod' and department_id = public.auth_dept())
);
create policy "profiles update self" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles update admin" on public.profiles for update
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- activities
create policy "activities select" on public.activities for select using (
  faculty_id = auth.uid()
  or public.auth_role() = 'admin'
  or (public.auth_role() = 'hod' and department_id = public.auth_dept())
);
create policy "activities insert own" on public.activities for insert
  with check (faculty_id = auth.uid());
create policy "activities update own pending" on public.activities for update
  using (faculty_id = auth.uid() and status = 'pending')
  with check (faculty_id = auth.uid() and status = 'pending');
create policy "activities hod review" on public.activities for update
  using (public.auth_role() = 'hod' and department_id = public.auth_dept())
  with check (public.auth_role() = 'hod' and department_id = public.auth_dept());
create policy "activities admin all" on public.activities for all
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');
create policy "activities delete own pending" on public.activities for delete
  using (faculty_id = auth.uid() and status = 'pending');

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.activities;
alter publication supabase_realtime add table public.profiles;

-- ---------- Sample departments ----------
insert into public.departments (name) values
  ('Computer Science'), ('Electronics'), ('Mechanical'), ('Civil'), ('Mathematics')
on conflict (name) do nothing;
