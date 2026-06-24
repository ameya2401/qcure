export type PatientStatus = "WAITING" | "ACTIVE" | "COMPLETED";

export interface Patient {
  id: string;
  token: string;
  name: string;
  status: PatientStatus;
  joinedAt: string;
  consultationStartedAt: string | null;
  consultationEndedAt: string | null;
  consultationDuration: number | null;
  isPriority?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicSettings {
  id: string;
  defaultConsultationTime: number;
  currentToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueueEvent {
  id: string;
  eventType: string;
  token: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface QueueAnalytics {
  patientsServedToday: number;
  averageConsultationDuration: number;
  longestWaitTime: number;
  currentQueueLength: number;
  peakQueueLength: number;
  receptionEfficiencyScore: number;
  queueHealth: "GREEN" | "YELLOW" | "RED";
}

export interface QueueMetrics {
  currentToken: string | null;
  waitingPatients: number;
  patientsServedToday: number;
  averageConsultationDuration: number;
  estimatedQueueTime: number;
  activePatient: Patient | null;
  queueLength: number;
  nextTokens: QueueRow[];
  totalWaitingPatients: number;
  longestWaitTime: number;
  peakQueueLength: number;
  receptionEfficiencyScore: number;
}

export interface QueueRow extends Patient {
  position: number | null;
  estimatedWait: number;
}

export interface QueueSnapshot {
  settings: ClinicSettings;
  patients: Patient[];
  queueRows: QueueRow[];
  queueEvents: QueueEvent[];
  metrics: QueueMetrics;
  analytics: QueueAnalytics;
  lastUpdatedAt: string;
  usingHistoricalAverage: boolean;
}

export interface AddPatientInput {
  name: string;
  isPriority?: boolean;
}

export interface UpdateClinicSettingsInput {
  defaultConsultationTime: number;
}

export interface QueueRepository {
  getQueueSnapshot(): Promise<QueueSnapshot>;
  addPatient(input: AddPatientInput): Promise<QueueSnapshot>;
  callNextPatient(): Promise<QueueSnapshot>;
  completeConsultation(): Promise<QueueSnapshot>;
  updateClinicSettings(input: UpdateClinicSettingsInput): Promise<QueueSnapshot>;
  subscribe(listener: (snapshot: QueueSnapshot) => void): () => void;
  isDemoMode(): boolean;
}
