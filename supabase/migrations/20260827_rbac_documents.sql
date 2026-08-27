-- TuraPlan RBAC + document distribution
-- Apply in Supabase SQL editor or via CLI after linking the project.
-- Policies mirror lib/rbac.ts

create extension if not exists "pgcrypto";

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('worker', 'supervisor', 'admin')),
  department_id uuid references public.departments (id),
  job_title text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles (id) on delete cascade,
  work_date date not null,
  start_time text not null,
  end_time text not null,
  location text not null,
  label text not null,
  status text not null check (status in ('shift', 'medical', 'vacation', 'unexcused')),
  confirmed boolean not null default true
);

create table if not exists public.hr_documents (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  expiry_date date not null,
  alert_days integer not null default 30
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('medical', 'ssm')),
  title text not null,
  scheduled_on date not null
);

create table if not exists public.distributed_documents (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('personal', 'department', 'company')),
  title text not null,
  file_name text,
  storage_path text,
  body text,
  recipient_id uuid references public.profiles (id) on delete cascade,
  department_id uuid references public.departments (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id),
  uploaded_at timestamptz not null default now(),
  constraint personal_has_recipient check (
    (scope = 'personal' and recipient_id is not null)
    or (scope <> 'personal')
  ),
  constraint department_has_dept check (
    (scope = 'department' and department_id is not null)
    or (scope <> 'department')
  )
);

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_department_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select department_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'admin', false)
$$;

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.shifts enable row level security;
alter table public.hr_documents enable row level security;
alter table public.appointments enable row level security;
alter table public.distributed_documents enable row level security;

-- Departments: authenticated can read; admin writes
create policy departments_read on public.departments
  for select to authenticated using (true);

create policy departments_admin_write on public.departments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Profiles: own row; supervisor sees team; admin sees all
create policy profiles_self on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and department_id = public.current_department_id()
    )
  );

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Shifts
create policy shifts_select on public.shifts
  for select to authenticated
  using (
    worker_id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  );

create policy shifts_write_staff on public.shifts
  for all to authenticated
  using (
    public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  );

-- HR expiry documents / appointments: same isolation
create policy hr_docs_select on public.hr_documents
  for select to authenticated
  using (
    worker_id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  );

create policy hr_docs_write_staff on public.hr_documents
  for all to authenticated
  using (
    public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  );

create policy appointments_select on public.appointments
  for select to authenticated
  using (
    worker_id = auth.uid()
    or public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  );

create policy appointments_write_staff on public.appointments
  for all to authenticated
  using (
    public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and worker_id in (
        select id from public.profiles
        where department_id = public.current_department_id()
          and role = 'worker'
      )
    )
  );

-- Distributed documents
create policy dist_select on public.distributed_documents
  for select to authenticated
  using (
    scope = 'company'
    or (scope = 'personal' and recipient_id = auth.uid())
    or (
      scope = 'department'
      and department_id = public.current_department_id()
    )
    or public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and department_id = public.current_department_id()
    )
  );

create policy dist_insert on public.distributed_documents
  for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and (
      (
        public.is_admin()
        and (
          scope = 'company'
          or scope = 'department'
          or (
            scope = 'personal'
            and recipient_id in (select id from public.profiles where role = 'worker')
          )
        )
      )
      or (
        public.current_role() = 'supervisor'
        and scope <> 'company'
        and department_id = public.current_department_id()
        and (
          scope = 'department'
          or (
            scope = 'personal'
            and recipient_id in (
              select id from public.profiles
              where department_id = public.current_department_id()
                and role = 'worker'
            )
          )
        )
      )
    )
  );

create policy dist_delete_staff on public.distributed_documents
  for delete to authenticated
  using (
    public.is_admin()
    or (
      public.current_role() = 'supervisor'
      and uploaded_by = auth.uid()
      and scope <> 'company'
      and department_id = public.current_department_id()
    )
  );

insert into storage.buckets (id, name, public)
values ('distributed-docs', 'distributed-docs', false)
on conflict (id) do nothing;

create policy storage_dist_read on storage.objects
  for select to authenticated
  using (bucket_id = 'distributed-docs');

create policy storage_dist_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'distributed-docs'
    and public.current_role() in ('supervisor', 'admin')
  );
