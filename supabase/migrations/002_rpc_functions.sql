create or replace function public.calculate_wait_times()
returns table (
  token text,
  status text,
  "position" integer,
  estimated_wait integer
)
language sql
security definer
set search_path = public
as $$
with settings as (
  select default_consultation_time from public.clinic_settings limit 1
),
completed as (
  select coalesce(avg(consultation_duration), (select default_consultation_time from settings))::integer as avg_duration
  from public.patients
  where status = 'COMPLETED' and consultation_duration is not null
),
ordered_waiting as (
  select
    p.id,
    p.token,
    p.status,
    row_number() over (order by p.token asc) as waiting_order
  from public.patients p
  where p.status = 'WAITING'
),
active as (
  select token from public.patients where status = 'ACTIVE' order by consultation_started_at asc nulls first limit 1
)
select
  p.token,
  p.status,
  case
    when p.status = 'ACTIVE' then 1
    when p.status = 'WAITING' then ow.waiting_order + case when exists (select 1 from active) then 1 else 0 end
    else null
  end as "position",
  case
    when p.status = 'WAITING'
      then ((ow.waiting_order - 1) + case when exists (select 1 from active) then 1 else 0 end) * (select avg_duration from completed)
    else 0
  end as estimated_wait
from public.patients p
left join ordered_waiting ow on ow.id = p.id
order by p.token asc;
$$;

create or replace function public.get_queue_metrics()
returns jsonb
language sql
security definer
set search_path = public
as $$
with settings as (
  select * from public.clinic_settings limit 1
),
completed as (
  select
    count(*) filter (where consultation_ended_at >= date_trunc('day', timezone('utc', now()))) as patients_served_today,
    coalesce(avg(consultation_duration), (select default_consultation_time from settings))::integer as average_consultation_duration
  from public.patients
  where status = 'COMPLETED'
),
queue_rows as (
  select * from public.calculate_wait_times()
),
active as (
  select token, name from public.patients where status = 'ACTIVE' limit 1
)
select jsonb_build_object(
  'current_token', coalesce((select token from active), (select current_token from settings)),
  'waiting_patients', (select count(*) from public.patients where status = 'WAITING'),
  'patients_served_today', (select patients_served_today from completed),
  'average_consultation_duration', (select average_consultation_duration from completed),
  'estimated_queue_time', coalesce((select max(estimated_wait) from queue_rows), 0),
  'queue_length', (select count(*) from public.patients where status in ('WAITING', 'ACTIVE'))
);
$$;

create or replace function public.add_patient(patient_name text)
returns public.patients
language plpgsql
security definer
set search_path = public
as $$
declare
  next_token_number integer;
  next_token text;
  active_exists boolean;
  inserted_patient public.patients;
begin
  if char_length(trim(patient_name)) < 2 then
    raise exception 'Patient name must be at least 2 characters';
  end if;

  lock table public.patients in exclusive mode;
  lock table public.clinic_settings in exclusive mode;

  select coalesce(max(nullif(regexp_replace(token, '\D', '', 'g'), '')::integer), 0) + 1
  into next_token_number
  from public.patients;

  next_token := 'T' || lpad(next_token_number::text, 3, '0');

  select exists(select 1 from public.patients where status = 'ACTIVE') into active_exists;

  insert into public.patients (
    token,
    name,
    status,
    joined_at,
    consultation_started_at
  )
  values (
    next_token,
    trim(patient_name),
    case when active_exists then 'WAITING' else 'ACTIVE' end,
    timezone('utc', now()),
    case when active_exists then null else timezone('utc', now()) end
  )
  returning * into inserted_patient;

  if not active_exists then
    update public.clinic_settings
    set current_token = inserted_patient.token
    where id = (select id from public.clinic_settings limit 1);
  end if;

  insert into public.queue_events(event_type, token, metadata)
  values ('PATIENT_ADDED', inserted_patient.token, jsonb_build_object('name', inserted_patient.name));

  return inserted_patient;
end;
$$;

create or replace function public.complete_consultation()
returns public.patients
language plpgsql
security definer
set search_path = public
as $$
declare
  active_patient public.patients;
  completed_patient public.patients;
begin
  lock table public.patients in exclusive mode;
  lock table public.clinic_settings in exclusive mode;

  select * into active_patient
  from public.patients
  where status = 'ACTIVE'
  order by consultation_started_at asc nulls first
  limit 1
  for update;

  if active_patient.id is null then
    return null;
  end if;

  update public.patients
  set
    status = 'COMPLETED',
    consultation_ended_at = timezone('utc', now()),
    consultation_duration = greatest(1, floor(extract(epoch from (timezone('utc', now()) - consultation_started_at)) / 60)::integer)
  where id = active_patient.id
  returning * into completed_patient;

  update public.clinic_settings
  set current_token = null
  where id = (select id from public.clinic_settings limit 1);

  insert into public.queue_events(event_type, token, metadata)
  values ('CONSULTATION_COMPLETED', completed_patient.token, jsonb_build_object('patient_id', completed_patient.id));

  return completed_patient;
end;
$$;

create or replace function public.call_next_patient()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  active_patient public.patients;
  next_patient public.patients;
  completed_patient public.patients;
begin
  lock table public.patients in exclusive mode;
  lock table public.clinic_settings in exclusive mode;

  select * into active_patient
  from public.patients
  where status = 'ACTIVE'
  order by consultation_started_at asc nulls first
  limit 1
  for update;

  if active_patient.id is not null then
    update public.patients
    set
      status = 'COMPLETED',
      consultation_ended_at = timezone('utc', now()),
      consultation_duration = greatest(1, floor(extract(epoch from (timezone('utc', now()) - consultation_started_at)) / 60)::integer)
    where id = active_patient.id
    returning * into completed_patient;

    insert into public.queue_events(event_type, token, metadata)
    values ('CONSULTATION_COMPLETED', completed_patient.token, jsonb_build_object('patient_id', completed_patient.id));
  end if;

  select * into next_patient
  from public.patients
  where status = 'WAITING'
  order by token asc
  limit 1
  for update;

  if next_patient.id is not null then
    update public.patients
    set
      status = 'ACTIVE',
      consultation_started_at = timezone('utc', now())
    where id = next_patient.id
    returning * into next_patient;

    update public.clinic_settings
    set current_token = next_patient.token
    where id = (select id from public.clinic_settings limit 1);

    insert into public.queue_events(event_type, token, metadata)
    values ('PATIENT_CALLED', next_patient.token, jsonb_build_object('patient_id', next_patient.id));
  else
    update public.clinic_settings
    set current_token = null
    where id = (select id from public.clinic_settings limit 1);
  end if;

  return public.get_queue_metrics();
end;
$$;

grant execute on function public.calculate_wait_times() to anon, authenticated, service_role;
grant execute on function public.get_queue_metrics() to anon, authenticated, service_role;
grant execute on function public.add_patient(text) to anon, authenticated, service_role;
grant execute on function public.complete_consultation() to anon, authenticated, service_role;
grant execute on function public.call_next_patient() to anon, authenticated, service_role;
