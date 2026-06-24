import type { ClinicSettings, Patient, QueueEvent } from "@/types/queue";

const now = new Date();

export const demoSettings: ClinicSettings = {
  id: "demo-settings",
  defaultConsultationTime: 6,
  currentToken: "T002",
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
};

export const demoPatients: Patient[] = [
  {
    id: "p1",
    token: "T001",
    name: "Anika Rao",
    status: "COMPLETED",
    joinedAt: new Date(now.getTime() - 50 * 60_000).toISOString(),
    consultationStartedAt: new Date(now.getTime() - 44 * 60_000).toISOString(),
    consultationEndedAt: new Date(now.getTime() - 38 * 60_000).toISOString(),
    consultationDuration: 6,
    createdAt: new Date(now.getTime() - 50 * 60_000).toISOString(),
    updatedAt: new Date(now.getTime() - 38 * 60_000).toISOString(),
  },
  {
    id: "p2",
    token: "T002",
    name: "Rahul Menon",
    status: "ACTIVE",
    joinedAt: new Date(now.getTime() - 34 * 60_000).toISOString(),
    consultationStartedAt: new Date(now.getTime() - 8 * 60_000).toISOString(),
    consultationEndedAt: null,
    consultationDuration: null,
    createdAt: new Date(now.getTime() - 34 * 60_000).toISOString(),
    updatedAt: new Date(now.getTime() - 8 * 60_000).toISOString(),
  },
  {
    id: "p3",
    token: "T003",
    name: "Sana Joseph",
    status: "WAITING",
    joinedAt: new Date(now.getTime() - 12 * 60_000).toISOString(),
    consultationStartedAt: null,
    consultationEndedAt: null,
    consultationDuration: null,
    createdAt: new Date(now.getTime() - 12 * 60_000).toISOString(),
    updatedAt: new Date(now.getTime() - 12 * 60_000).toISOString(),
  },
  {
    id: "p4",
    token: "T004",
    name: "Ishaan Patel",
    status: "WAITING",
    joinedAt: new Date(now.getTime() - 7 * 60_000).toISOString(),
    consultationStartedAt: null,
    consultationEndedAt: null,
    consultationDuration: null,
    createdAt: new Date(now.getTime() - 7 * 60_000).toISOString(),
    updatedAt: new Date(now.getTime() - 7 * 60_000).toISOString(),
  },
];

export const demoEvents: QueueEvent[] = [
  {
    id: "e1",
    eventType: "PATIENT_CALLED",
    token: "T002",
    metadata: { source: "demo" },
    createdAt: new Date(now.getTime() - 8 * 60_000).toISOString(),
  },
  {
    id: "e2",
    eventType: "PATIENT_ADDED",
    token: "T004",
    metadata: { source: "demo" },
    createdAt: new Date(now.getTime() - 7 * 60_000).toISOString(),
  },
];
