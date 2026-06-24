import { hasSupabaseConfig } from "@/lib/env";
import { mockQueueRepository } from "@/services/queue/mockQueueRepository";
import { supabaseQueueRepository } from "@/services/queue/supabaseQueueRepository";

export const queueRepository = hasSupabaseConfig()
  ? supabaseQueueRepository
  : mockQueueRepository;
