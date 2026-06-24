import { useQuery } from "@tanstack/react-query";
import { queueService } from "@/services/queue/queueService";

export function useQueueSnapshot() {
  return useQuery({
    queryKey: ["queue-snapshot"],
    queryFn: queueService.getSnapshot,
  });
}
