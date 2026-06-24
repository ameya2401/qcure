import { supabase } from "@/lib/supabase";
import { buildSnapshot } from "@/utils/queue";
import type {
  AddPatientInput,
  ClinicSettings,
  Patient,
  QueueEvent,
  QueueRepository,
  QueueSnapshot,
  UpdateClinicSettingsInput,
} from "@/types/queue";

function mapPatient(row: Record<string, unknown>): Patient {
  return {
    id: String(row.id),
    token: String(row.token),
    name: String(row.name),
    status: String(row.status) as Patient["status"],
    joinedAt: String(row.joined_at),
    consultationStartedAt: (row.consultation_started_at as string | null) ?? null,
    consultationEndedAt: (row.consultation_ended_at as string | null) ?? null,
    consultationDuration: (row.consultation_duration as number | null) ?? null,
    isPriority: Boolean(row.is_priority),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapSettings(row: Record<string, unknown>): ClinicSettings {
  return {
    id: String(row.id),
    defaultConsultationTime: Number(row.default_consultation_time),
    currentToken: (row.current_token as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapEvent(row: Record<string, unknown>): QueueEvent {
  return {
    id: String(row.id),
    eventType: String(row.event_type),
    token: (row.token as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
  };
}

async function loadSnapshot() {
  const [patientsResult, settingsResult, eventsResult] = await Promise.all([
    supabase.from("patients").select("*").order("token", { ascending: true }),
    supabase.from("clinic_settings").select("*").limit(1).single(),
    supabase.from("queue_events").select("*").order("created_at", { ascending: false }).limit(25),
  ]);

  if (patientsResult.error) {
    throw patientsResult.error;
  }

  if (settingsResult.error) {
    throw settingsResult.error;
  }

  if (eventsResult.error) {
    throw eventsResult.error;
  }

  return buildSnapshot(
    (patientsResult.data ?? []).map((row) => mapPatient(row as Record<string, unknown>)),
    mapSettings(settingsResult.data as Record<string, unknown>),
    (eventsResult.data ?? []).map((row) => mapEvent(row as Record<string, unknown>)),
  );
}

async function callProcedure(functionName: "add_patient" | "call_next_patient" | "complete_consultation", args: Record<string, unknown>) {
  const { error } = await supabase.rpc(functionName as never, args as never);

  if (error) {
    throw error;
  }

  return loadSnapshot();
}

export const supabaseQueueRepository: QueueRepository = {
  async getQueueSnapshot() {
    return loadSnapshot();
  },
  async addPatient(input: AddPatientInput) {
    return callProcedure("add_patient", { 
      patient_name: input.name.trim(),
      is_priority: input.isPriority ?? false
    });
  },
  async callNextPatient() {
    return callProcedure("call_next_patient", {});
  },
  async completeConsultation() {
    return callProcedure("complete_consultation", {});
  },
  async updateClinicSettings(input: UpdateClinicSettingsInput) {
    const { error } = await supabase
      .from("clinic_settings")
      .update({ default_consultation_time: input.defaultConsultationTime } as never)
      .eq("id", (await loadSnapshot()).settings.id);

    if (error) {
      throw error;
    }

    return loadSnapshot();
  },
  subscribe(listener) {
    let cancelled = false;

    const channel = supabase
      .channel("queue-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        async () => {
          if (!cancelled) {
            listener(await loadSnapshot());
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clinic_settings" },
        async () => {
          if (!cancelled) {
            listener(await loadSnapshot());
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_events" },
        async () => {
          if (!cancelled) {
            listener(await loadSnapshot());
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  },
  isDemoMode() {
    return false;
  },
};
