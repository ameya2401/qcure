export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          token: string;
          name: string;
          status: string;
          joined_at: string;
          consultation_started_at: string | null;
          consultation_ended_at: string | null;
          consultation_duration: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      clinic_settings: {
        Row: {
          id: string;
          default_consultation_time: number;
          current_token: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      queue_events: {
        Row: {
          id: string;
          event_type: string;
          token: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
      };
    };
    Functions: {
      add_patient: {
        Args: { patient_name: string };
        Returns: unknown;
      };
      call_next_patient: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      complete_consultation: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      calculate_wait_times: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      get_queue_metrics: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
  };
}
