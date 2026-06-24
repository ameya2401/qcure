import { queueRepository } from "@/services/queue/queueRepository";
import type { AddPatientInput, UpdateClinicSettingsInput } from "@/types/queue";

export const queueService = {
  getSnapshot: () => queueRepository.getQueueSnapshot(),
  addPatient: (input: AddPatientInput) => queueRepository.addPatient(input),
  callNextPatient: () => queueRepository.callNextPatient(),
  completeConsultation: () => queueRepository.completeConsultation(),
  updateClinicSettings: (input: UpdateClinicSettingsInput) =>
    queueRepository.updateClinicSettings(input),
  subscribe: queueRepository.subscribe,
  isDemoMode: queueRepository.isDemoMode,
};
