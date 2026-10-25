-- Run AFTER schema.sql. Adds sample departments.
insert into public.departments (name) values
  ('Computer Science'), ('Electronics'), ('Mechanical'), ('Civil'), ('Mathematics')
on conflict (name) do nothing;

-- Promote yourself to admin (sign up in the app first, then run with your email):
-- update public.profiles set role = 'admin' where email = 'you@example.com';

-- Make someone a Head of Department (or use the Admin screen in the app):
-- update public.profiles
--   set role = 'hod',
--       department_id = (select id from public.departments where name = 'Computer Science')
--   where email = 'hod@example.com';
