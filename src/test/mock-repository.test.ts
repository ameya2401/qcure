import { mockQueueRepository } from "@/services/queue/mockQueueRepository";

describe("mock queue repository", () => {
  it("creates incrementing tokens for patient registration", async () => {
    const snapshot = await mockQueueRepository.addPatient({ name: "Naina Shah" });

    expect(snapshot.patients.at(-1)?.token).toBe("T005");
  });

  it("advances the queue when calling next patient", async () => {
    const snapshot = await mockQueueRepository.callNextPatient();
    const activePatient = snapshot.patients.find((patient) => patient.status === "ACTIVE");
    const completedPatient = snapshot.patients.find((patient) => patient.token === "T002");

    expect(activePatient?.token).toBe("T003");
    expect(completedPatient?.status).toBe("COMPLETED");
  });

  it("publishes updates to subscribers", async () => {
    const listener = vi.fn();
    const unsubscribe = mockQueueRepository.subscribe(listener);

    await mockQueueRepository.updateClinicSettings({ defaultConsultationTime: 9 });

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });
});
