import { buildSnapshot, getConsultationDuration } from "@/utils/queue";
import { demoEvents, demoPatients, demoSettings } from "@/lib/mock-data";
import type {
  AddPatientInput,
  ClinicSettings,
  Patient,
  QueueEvent,
  QueueRepository,
  QueueSnapshot,
  UpdateClinicSettingsInput,
} from "@/types/queue";

interface DemoState {
  patients: Patient[];
  settings: ClinicSettings;
  events: QueueEvent[];
}

const listeners = new Set<(snapshot: QueueSnapshot) => void>();

const demoState: DemoState = {
  patients: demoPatients,
  settings: demoSettings,
  events: demoEvents,
};

function generateToken(patients: Patient[]) {
  const nextNumber =
    patients.reduce((max, patient) => Math.max(max, Number(patient.token.replace("T", ""))), 0) +
    1;

  return `T${String(nextNumber).padStart(3, "0")}`;
}

function getSnapshot() {
  return buildSnapshot(demoState.patients, demoState.settings, demoState.events);
}

function broadcast() {
  const snapshot = getSnapshot();
  listeners.forEach((listener) => listener(snapshot));
  return snapshot;
}

function createEvent(eventType: string, token: string | null, metadata: Record<string, unknown>) {
  demoState.events = [
    {
      id: crypto.randomUUID(),
      eventType,
      token,
      metadata,
      createdAt: new Date().toISOString(),
    },
    ...demoState.events,
  ];
}

export const mockQueueRepository: QueueRepository = {
  async getQueueSnapshot() {
    return getSnapshot();
  },
  async addPatient(input: AddPatientInput) {
    const token = generateToken(demoState.patients);
    const activeExists = demoState.patients.some((patient) => patient.status === "ACTIVE");
    const patient: Patient = {
      id: crypto.randomUUID(),
      token,
      name: input.name.trim(),
      status: activeExists ? "WAITING" : "ACTIVE",
      joinedAt: new Date().toISOString(),
      consultationStartedAt: activeExists ? null : new Date().toISOString(),
      consultationEndedAt: null,
      consultationDuration: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoState.patients = [...demoState.patients, patient];
    if (!activeExists) {
      demoState.settings = {
        ...demoState.settings,
        currentToken: token,
        updatedAt: new Date().toISOString(),
      };
    }
    createEvent("PATIENT_ADDED", token, { name: patient.name, mode: "demo" });
    return broadcast();
  },
  async callNextPatient() {
    const activePatient = demoState.patients.find((patient) => patient.status === "ACTIVE");
    const nextWaiting = demoState.patients
      .filter((patient) => patient.status === "WAITING")
      .sort((left, right) => left.token.localeCompare(right.token))[0];
    const now = new Date().toISOString();

    demoState.patients = demoState.patients.map((patient) => {
      if (activePatient && patient.id === activePatient.id) {
        return {
          ...patient,
          status: "COMPLETED",
          consultationEndedAt: now,
          consultationDuration: getConsultationDuration(patient.consultationStartedAt, now),
          updatedAt: now,
        };
      }

      if (nextWaiting && patient.id === nextWaiting.id) {
        return {
          ...patient,
          status: "ACTIVE",
          consultationStartedAt: now,
          updatedAt: now,
        };
      }

      return patient;
    });

    demoState.settings = {
      ...demoState.settings,
      currentToken: nextWaiting?.token ?? null,
      updatedAt: now,
    };
    createEvent("PATIENT_CALLED", nextWaiting?.token ?? null, { mode: "demo" });
    return broadcast();
  },
  async completeConsultation() {
    const activePatient = demoState.patients.find((patient) => patient.status === "ACTIVE");
    if (!activePatient) {
      return getSnapshot();
    }

    const now = new Date().toISOString();
    demoState.patients = demoState.patients.map((patient) =>
      patient.id === activePatient.id
        ? {
            ...patient,
            status: "COMPLETED",
            consultationEndedAt: now,
            consultationDuration: getConsultationDuration(patient.consultationStartedAt, now),
            updatedAt: now,
          }
        : patient,
    );
    demoState.settings = {
      ...demoState.settings,
      currentToken: null,
      updatedAt: now,
    };
    createEvent("CONSULTATION_COMPLETED", activePatient.token, { mode: "demo" });
    return broadcast();
  },
  async updateClinicSettings(input: UpdateClinicSettingsInput) {
    demoState.settings = {
      ...demoState.settings,
      defaultConsultationTime: input.defaultConsultationTime,
      updatedAt: new Date().toISOString(),
    };
    createEvent("SETTINGS_UPDATED", null, { ...input, mode: "demo" });
    return broadcast();
  },
  subscribe(listener) {
    listeners.add(listener);
    const interval = window.setInterval(() => {
      listener(getSnapshot());
    }, 30_000);

    return () => {
      listeners.delete(listener);
      window.clearInterval(interval);
    };
  },
  isDemoMode() {
    return true;
  },
};
