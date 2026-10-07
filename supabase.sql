-- =====================================================================
--  أهلية أكاديمي — قاعدة البيانات على Supabase
--  الاستخدام: Supabase > SQL Editor > New query > الصق الملف كله > Run
--  (آمن تشغيله أكتر من مرة)
-- =====================================================================

-- ---------- 1) البروفايل (بيتعمل تلقائي عند التسجيل) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null check (char_length(name) between 3 and 80),
  major      text not null check (major in ('year1','year2','cs','ai','is')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name  text := left(btrim(coalesce(new.raw_user_meta_data->>'name', '')), 80);
  v_major text := coalesce(new.raw_user_meta_data->>'major', '');
begin
  if char_length(v_name) < 3 or v_major not in ('year1','year2','cs','ai','is') then
    raise exception 'بيانات التسجيل غير صالحة';
  end if;
  insert into public.profiles (id, name, major) values (new.id, v_name, v_major);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2) الاشتراك والتقدّم ----------
create table if not exists public.enrollments (
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  text not null check (course_id ~ '^[A-Za-z0-9_.-]{1,80}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.lecture_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (course_id ~ '^[A-Za-z0-9_.-]{1,80}$'),
  lecture   int  not null check (lecture between 0 and 499),
  done_at   timestamptz not null default now(),
  primary key (user_id, course_id, lecture)
);

create table if not exists public.course_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  text not null check (course_id ~ '^[A-Za-z0-9_.-]{1,80}$'),
  data       jsonb not null check (octet_length(data::text) < 65536),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- ---------- 3) الجدول ----------
create table if not exists public.schedule_items (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null check (char_length(title) between 2 and 120),
  kind       text not null check (kind in ('محاضرة','سكشن','تسليم','امتحان')),
  day        int  not null check (day between 0 and 6),
  time       text not null check (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  place      text not null default '' check (char_length(place) <= 80),
  created_at timestamptz not null default now()
);
create index if not exists idx_schedule_user on public.schedule_items(user_id);

create or replace function public.limit_schedule()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.schedule_items where user_id = new.user_id) >= 300 then
    raise exception 'وصلت للحد الأقصى من المواعيد (300)';
  end if;
  return new;
end $$;
drop trigger if exists trg_limit_schedule on public.schedule_items;
create trigger trg_limit_schedule before insert on public.schedule_items
  for each row execute function public.limit_schedule();

-- ---------- 4) طلبات زملاء المشروع (مشتركة بين كل الطلاب) ----------
create table if not exists public.team_posts (
  id          text primary key default substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default '',
  type        text not null check (type in ('need','have')),
  subject     text not null check (char_length(subject) between 1 and 120),
  role        text not null check (char_length(role) between 1 and 120),
  year        text not null default '' check (char_length(year) <= 30),
  count       int  not null default 1 check (count between 1 and 20),
  description text not null default '' check (char_length(description) <= 600),
  contact     text not null check (char_length(contact) between 1 and 200),
  closed      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_posts_created on public.team_posts(created_at desc);

-- اسم صاحب الطلب بيتاخد من البروفايل (مش من المتصفح) + حد أقصى 10 طلبات مفتوحة
create or replace function public.prepare_team_post()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select name into new.name from public.profiles where id = new.user_id;
  if (select count(*) from public.team_posts where user_id = new.user_id and not closed) >= 10 then
    raise exception 'عندك 10 طلبات مفتوحة، اقفل بعضها الأول';
  end if;
  return new;
end $$;
drop trigger if exists trg_prepare_team_post on public.team_posts;
create trigger trg_prepare_team_post before insert on public.team_posts
  for each row execute function public.prepare_team_post();

-- ---------- 5) الحماية (Row Level Security) ----------
-- مفتاح anon ظاهر في الموقع بطبيعته؛ اللي بيحمي البيانات هي السياسات دي.
alter table public.profiles         enable row level security;
alter table public.enrollments      enable row level security;
alter table public.lecture_progress enable row level security;
alter table public.course_progress  enable row level security;
alter table public.schedule_items   enable row level security;
alter table public.team_posts       enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "own enrollments" on public.enrollments;
create policy "own enrollments" on public.enrollments
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own lectures" on public.lecture_progress;
create policy "own lectures" on public.lecture_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own course progress" on public.course_progress;
create policy "own course progress" on public.course_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own schedule" on public.schedule_items;
create policy "own schedule" on public.schedule_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "posts readable by students" on public.team_posts;
create policy "posts readable by students" on public.team_posts
  for select to authenticated using (true);
drop policy if exists "posts insert own" on public.team_posts;
create policy "posts insert own" on public.team_posts
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "posts update own" on public.team_posts;
create policy "posts update own" on public.team_posts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "posts delete own" on public.team_posts;
create policy "posts delete own" on public.team_posts
  for delete to authenticated using (user_id = auth.uid());

-- ---------- 6) صلاحيات الجداول ----------
-- المستخدم المسجّل بس. الزائر (anon) ما يقدرش يقرأ أو يكتب أي حاجة.
revoke all on public.profiles, public.enrollments, public.lecture_progress,
              public.course_progress, public.schedule_items, public.team_posts from anon;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.enrollments, public.lecture_progress,
      public.course_progress, public.schedule_items, public.team_posts to authenticated;
