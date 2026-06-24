import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

export const supabase = createClient<Database>(env.supabaseUrl || "https://placeholder.supabase.co", env.supabaseAnonKey || "placeholder", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
