import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queueService } from "@/services/queue/queueService";

export function useQueueMutations() {
  const queryClient = useQueryClient();

  const onSuccess = (message: string) => {
    toast.success(message);
    return queryClient.invalidateQueries({ queryKey: ["queue-snapshot"] });
  };

  const onError = (message: string) => (error: Error) => {
    toast.error(message, {
      description: error.message,
    });
  };

  return {
    addPatient: useMutation({
      mutationFn: queueService.addPatient,
      onSuccess: () => onSuccess("Patient registered"),
      onError: onError("Unable to register patient"),
    }),
    callNextPatient: useMutation({
      mutationFn: queueService.callNextPatient,
      onSuccess: () => onSuccess("Queue advanced"),
      onError: onError("Unable to advance queue"),
    }),
    completeConsultation: useMutation({
      mutationFn: queueService.completeConsultation,
      onSuccess: () => onSuccess("Consultation completed"),
      onError: onError("Unable to complete consultation"),
    }),
    updateClinicSettings: useMutation({
      mutationFn: queueService.updateClinicSettings,
      onSuccess: () => onSuccess("Clinic settings updated"),
      onError: onError("Unable to update clinic settings"),
    }),
  };
}
