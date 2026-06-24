-- 1. Add is_priority column to patients table
ALTER TABLE public.patients
ADD COLUMN is_priority BOOLEAN NOT NULL DEFAULT false;

-- 2. Drop the old RPC so we can recreate it with a new signature
DROP FUNCTION IF EXISTS public.add_patient(text);

-- 3. Recreate add_patient to accept is_priority
CREATE OR REPLACE FUNCTION public.add_patient(patient_name text, is_priority boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token text;
  is_active_exists boolean;
  new_status text;
  new_consultation_started_at timestamptz;
BEGIN
  -- Generate token logic (simplified for brevity, matching previous implementation)
  SELECT 'T' || to_char(COALESCE(count(*), 0) + 1, 'FM000')
  INTO new_token
  FROM public.patients
  WHERE created_at >= date_trunc('day', timezone('utc', now()));

  -- Check if there is an active patient
  SELECT EXISTS (
    SELECT 1 FROM public.patients WHERE status = 'ACTIVE'
  ) INTO is_active_exists;

  IF is_active_exists THEN
    new_status := 'WAITING';
    new_consultation_started_at := null;
  ELSE
    new_status := 'ACTIVE';
    new_consultation_started_at := timezone('utc', now());
    
    UPDATE public.clinic_settings
    SET current_token = new_token,
        updated_at = timezone('utc', now())
    WHERE id IS NOT NULL;
  END IF;

  -- Insert the new patient WITH the is_priority flag
  INSERT INTO public.patients (
    token, name, status, consultation_started_at, is_priority
  ) VALUES (
    new_token, patient_name, new_status, new_consultation_started_at, is_priority
  );

  INSERT INTO public.queue_events (event_type, token, metadata)
  VALUES ('PATIENT_ADDED', new_token, jsonb_build_object('name', patient_name, 'is_priority', is_priority));
END;
$$;

-- 4. Drop the old call_next_patient so we can recreate it
DROP FUNCTION IF EXISTS public.call_next_patient();

-- 5. Update the call_next_patient RPC to sort by priority first!
CREATE OR REPLACE FUNCTION public.call_next_patient()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_patient record;
  current_patient record;
BEGIN
  -- Get the currently active patient
  SELECT * INTO current_patient
  FROM public.patients
  WHERE status = 'ACTIVE'
  LIMIT 1;

  -- Complete the current patient
  IF FOUND THEN
    UPDATE public.patients
    SET status = 'COMPLETED',
        consultation_ended_at = timezone('utc', now()),
        consultation_duration = extract(epoch from (timezone('utc', now()) - consultation_started_at)) / 60
    WHERE id = current_patient.id;

    INSERT INTO public.queue_events (event_type, token, metadata)
    VALUES ('CONSULTATION_COMPLETED', current_patient.token, jsonb_build_object('duration', extract(epoch from (timezone('utc', now()) - current_patient.consultation_started_at)) / 60));
  END IF;

  -- Get the NEXT waiting patient (SORTED BY PRIORITY FIRST, then token/joined_at)
  SELECT * INTO next_patient
  FROM public.patients
  WHERE status = 'WAITING'
  ORDER BY is_priority DESC, joined_at ASC
  LIMIT 1;

  IF FOUND THEN
    -- Make the next patient active
    UPDATE public.patients
    SET status = 'ACTIVE',
        consultation_started_at = timezone('utc', now())
    WHERE id = next_patient.id;

    UPDATE public.clinic_settings
    SET current_token = next_patient.token,
        updated_at = timezone('utc', now())
    WHERE id IS NOT NULL;

    INSERT INTO public.queue_events (event_type, token, metadata)
    VALUES ('PATIENT_CALLED', next_patient.token, '{}'::jsonb);
  ELSE
    -- No one left in the queue
    UPDATE public.clinic_settings
    SET current_token = null,
        updated_at = timezone('utc', now())
    WHERE id IS NOT NULL;
  END IF;
END;
$$;
