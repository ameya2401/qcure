create extension if not exists "pgcrypto";

create table if not exists public.clinic_settings (
  id uuid primary key default gen_random_uuid(),
  default_consultation_time integer not null default 5 check (default_consultation_time > 0),
  current_token text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  name text not null check (char_length(trim(name)) >= 2),
  status text not null check (status in ('WAITING', 'ACTIVE', 'COMPLETED')),
  joined_at timestamptz not null default timezone('utc', now()),
  consultation_started_at timestamptz,
  consultation_ended_at timestamptz,
  consultation_duration integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.queue_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  token text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists patients_status_idx on public.patients(status);
create index if not exists patients_joined_at_idx on public.patients(joined_at);
create index if not exists queue_events_created_at_idx on public.queue_events(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_updated_at_patients on public.patients;
create trigger set_updated_at_patients
before update on public.patients
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_clinic_settings on public.clinic_settings;
create trigger set_updated_at_clinic_settings
before update on public.clinic_settings
for each row
execute function public.set_updated_at();

insert into public.clinic_settings (id, default_consultation_time, current_token)
select gen_random_uuid(), 5, null
where not exists (select 1 from public.clinic_settings);

alter table public.clinic_settings enable row level security;
alter table public.patients enable row level security;
alter table public.queue_events enable row level security;

create policy "public read clinic settings"
on public.clinic_settings
for select
using (true);

create policy "public read patients"
on public.patients
for select
using (true);

create policy "public read queue events"
on public.queue_events
for select
using (true);

create policy "service role manage clinic settings"
on public.clinic_settings
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manage patients"
on public.patients
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manage queue events"
on public.queue_events
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
