insert into public.clinic_settings (id, default_consultation_time, current_token)
select gen_random_uuid(), 6, 'T002'
where not exists (select 1 from public.clinic_settings);

insert into public.patients (token, name, status, joined_at, consultation_started_at, consultation_ended_at, consultation_duration)
values
  ('T001', 'Anika Rao', 'COMPLETED', timezone('utc', now()) - interval '50 minutes', timezone('utc', now()) - interval '44 minutes', timezone('utc', now()) - interval '38 minutes', 6),
  ('T002', 'Rahul Menon', 'ACTIVE', timezone('utc', now()) - interval '34 minutes', timezone('utc', now()) - interval '8 minutes', null, null),
  ('T003', 'Sana Joseph', 'WAITING', timezone('utc', now()) - interval '12 minutes', null, null, null),
  ('T004', 'Ishaan Patel', 'WAITING', timezone('utc', now()) - interval '7 minutes', null, null, null)
on conflict (token) do nothing;

insert into public.queue_events (event_type, token, metadata)
values
  ('PATIENT_CALLED', 'T002', '{"source": "seed"}'),
  ('PATIENT_ADDED', 'T004', '{"source": "seed"}');
