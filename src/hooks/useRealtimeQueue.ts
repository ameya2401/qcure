import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queueService } from "@/services/queue/queueService";

export function useRealtimeQueue() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return queueService.subscribe((snapshot) => {
      queryClient.setQueryData(["queue-snapshot"], snapshot);
    });
  }, [queryClient]);
}
