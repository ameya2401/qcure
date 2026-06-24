import { buildSnapshot, deriveAverageConsultationDuration, mapQueueRows } from "@/utils/queue";
import { demoEvents, demoPatients, demoSettings } from "@/lib/mock-data";

describe("queue utilities", () => {
  it("uses historical average when completed consultations exist", () => {
    const result = deriveAverageConsultationDuration(demoPatients, demoSettings);

    expect(result.average).toBe(6);
    expect(result.usingHistoricalAverage).toBe(true);
  });

  it("falls back to clinic settings when no history exists", () => {
    const patients = demoPatients.map((patient) => ({
      ...patient,
      status: patient.status === "COMPLETED" ? "WAITING" : patient.status,
      consultationDuration: null,
    }));

    const result = deriveAverageConsultationDuration(patients, demoSettings);

    expect(result.average).toBe(demoSettings.defaultConsultationTime);
    expect(result.usingHistoricalAverage).toBe(false);
  });

  it("assigns positions and estimated waits from active plus waiting patients", () => {
    const rows = mapQueueRows(demoPatients, demoSettings).rows;
    const active = rows.find((patient) => patient.token === "T002");
    const waiting = rows.find((patient) => patient.token === "T003");

    expect(active?.position).toBe(1);
    expect(waiting?.position).toBe(2);
    expect(waiting?.estimatedWait).toBe(6);
  });

  it("builds analytics-ready queue metrics", () => {
    const snapshot = buildSnapshot(demoPatients, demoSettings, demoEvents);

    expect(snapshot.metrics.currentToken).toBe("T002");
    expect(snapshot.analytics.currentQueueLength).toBe(3);
    expect(snapshot.analytics.queueHealth).toBe("YELLOW");
  });
});
