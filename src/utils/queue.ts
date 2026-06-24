import { differenceInMinutes, startOfDay } from "date-fns";
import type {
  ClinicSettings,
  Patient,
  QueueAnalytics,
  QueueMetrics,
  QueueRow,
  QueueSnapshot,
} from "@/types/queue";

const CLINIC_HOURS = 10;

export function sortPatients(left: Patient, right: Patient) {
  const statusOrder = { COMPLETED: 0, ACTIVE: 1, WAITING: 2 };
  if (statusOrder[left.status] !== statusOrder[right.status]) {
    return statusOrder[left.status] - statusOrder[right.status];
  }
  
  if (left.status === "WAITING") {
    if (left.isPriority && !right.isPriority) return -1;
    if (!left.isPriority && right.isPriority) return 1;
  }
  
  return left.token.localeCompare(right.token);
}

export function deriveAverageConsultationDuration(
  patients: Patient[],
  settings: ClinicSettings,
) {
  const completed = patients.filter(
    (patient) =>
      patient.status === "COMPLETED" &&
      typeof patient.consultationDuration === "number" &&
      patient.consultationDuration > 0,
  );

  if (!completed.length) {
    return {
      average: settings.defaultConsultationTime,
      usingHistoricalAverage: false,
    };
  }

  const total = completed.reduce(
    (sum, patient) => sum + (patient.consultationDuration ?? 0),
    0,
  );

  return {
    average: Math.max(1, Math.round(total / completed.length)),
    usingHistoricalAverage: true,
  };
}

export function mapQueueRows(
  patients: Patient[],
  settings: ClinicSettings,
): { rows: QueueRow[]; averageDuration: number; usingHistoricalAverage: boolean } {
  const { average, usingHistoricalAverage } = deriveAverageConsultationDuration(
    patients,
    settings,
  );
  const activeToken = patients.find((patient) => patient.status === "ACTIVE")?.token ?? null;

  const waiting = patients
    .filter((patient) => patient.status === "WAITING")
    .sort(sortPatients);

  const activeCount = activeToken ? 1 : 0;

  const rows = patients
    .slice()
    .sort(sortPatients)
    .map((patient) => {
      if (patient.status === "COMPLETED") {
        return { ...patient, position: null, estimatedWait: 0 };
      }

      if (patient.status === "ACTIVE") {
        return { ...patient, position: 1, estimatedWait: 0 };
      }

      const waitingIndex = waiting.findIndex((entry) => entry.id === patient.id);
      const position = waitingIndex + 1 + activeCount;
      const patientsAhead = Math.max(0, position - 1);

      return {
        ...patient,
        position,
        estimatedWait: patientsAhead * average,
      };
    });

  return { rows, averageDuration: average, usingHistoricalAverage };
}

export function deriveQueueMetrics(
  patients: Patient[],
  settings: ClinicSettings,
): QueueMetrics {
  const activePatient = patients.find((patient) => patient.status === "ACTIVE") ?? null;
  const waitingPatients = patients.filter((patient) => patient.status === "WAITING");
  const completedToday = patients.filter((patient) => {
    if (patient.status !== "COMPLETED" || !patient.consultationEndedAt) {
      return false;
    }

    return new Date(patient.consultationEndedAt) >= startOfDay(new Date());
  });
  const { rows, averageDuration } = mapQueueRows(patients, settings);
  const estimatedQueueTime = waitingPatients.length * averageDuration;
  const longestWaitTime = rows.reduce(
    (max, patient) => Math.max(max, patient.estimatedWait),
    0,
  );
  const queueLength = patients.filter((patient) => patient.status !== "COMPLETED").length;
  const peakQueueLength = patients.reduce((peak, _, index) => Math.max(peak, index + 1), 0);

  return {
    currentToken: activePatient?.token ?? settings.currentToken,
    waitingPatients: waitingPatients.length,
    patientsServedToday: completedToday.length,
    averageConsultationDuration: averageDuration,
    estimatedQueueTime,
    activePatient,
    queueLength,
    nextTokens: rows.filter((patient) => patient.status === "WAITING").slice(0, 10),
    totalWaitingPatients: waitingPatients.length,
    longestWaitTime,
    peakQueueLength,
    receptionEfficiencyScore: Number((completedToday.length / CLINIC_HOURS).toFixed(1)),
  };
}

export function deriveQueueAnalytics(metrics: QueueMetrics): QueueAnalytics {
  const queueHealth =
    metrics.estimatedQueueTime < 10
      ? "GREEN"
      : metrics.estimatedQueueTime <= 30
        ? "YELLOW"
        : "RED";

  return {
    patientsServedToday: metrics.patientsServedToday,
    averageConsultationDuration: metrics.averageConsultationDuration,
    longestWaitTime: metrics.longestWaitTime,
    currentQueueLength: metrics.queueLength,
    peakQueueLength: metrics.peakQueueLength,
    receptionEfficiencyScore: metrics.receptionEfficiencyScore,
    queueHealth,
  };
}

export function buildSnapshot(
  patients: Patient[],
  settings: ClinicSettings,
  queueEvents: QueueSnapshot["queueEvents"],
): QueueSnapshot {
  const { rows, usingHistoricalAverage } = mapQueueRows(patients, settings);
  const metrics = deriveQueueMetrics(patients, settings);

  return {
    settings,
    patients: patients
      .slice()
      .sort(sortPatients),
    queueRows: rows,
    queueEvents: queueEvents
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    metrics,
    analytics: deriveQueueAnalytics(metrics),
    lastUpdatedAt: new Date().toISOString(),
    usingHistoricalAverage,
  };
}

export function getConsultationDuration(startedAt: string | null, endedAt: string) {
  if (!startedAt) {
    return 0;
  }

  return Math.max(1, differenceInMinutes(new Date(endedAt), new Date(startedAt)));
}
