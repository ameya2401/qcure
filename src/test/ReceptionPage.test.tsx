import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceptionPage } from "@/pages/ReceptionPage";
import { queueService } from "@/services/queue/queueService";

vi.mock("@/services/queue/queueService", () => ({
  queueService: {
    getSnapshot: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    addPatient: vi.fn(),
    callNextPatient: vi.fn(),
    completeConsultation: vi.fn(),
    updateClinicSettings: vi.fn(),
    isDemoMode: () => true,
  },
}));

const snapshot = {
  settings: {
    id: "1",
    defaultConsultationTime: 5,
    currentToken: "T001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  patients: [],
  queueRows: [],
  queueEvents: [],
  metrics: {
    currentToken: "T001",
    waitingPatients: 3,
    patientsServedToday: 2,
    averageConsultationDuration: 6,
    estimatedQueueTime: 18,
    activePatient: null,
    queueLength: 3,
    nextTokens: [],
    totalWaitingPatients: 3,
    longestWaitTime: 18,
    peakQueueLength: 5,
    receptionEfficiencyScore: 0.2,
  },
  analytics: {
    patientsServedToday: 2,
    averageConsultationDuration: 6,
    longestWaitTime: 18,
    currentQueueLength: 3,
    peakQueueLength: 5,
    receptionEfficiencyScore: 0.2,
    queueHealth: "YELLOW" as const,
  },
  lastUpdatedAt: new Date().toISOString(),
  usingHistoricalAverage: true,
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <ReceptionPage />
    </QueryClientProvider>,
  );
}

describe("ReceptionPage", () => {
  beforeEach(() => {
    vi.mocked(queueService.getSnapshot).mockResolvedValue(snapshot);
    vi.mocked(queueService.addPatient).mockResolvedValue(snapshot);
    vi.mocked(queueService.callNextPatient).mockResolvedValue(snapshot);
    vi.mocked(queueService.completeConsultation).mockResolvedValue(snapshot);
    vi.mocked(queueService.updateClinicSettings).mockResolvedValue(snapshot);
  });

  it("renders queue metrics", async () => {
    renderPage();

    expect(await screen.findByText("Current token")).toBeInTheDocument();
    expect(screen.getByText("T001")).toBeInTheDocument();
  });

  it("submits patient registration", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(await screen.findByPlaceholderText("Patient name"), "Mira Sen");
    await user.click(screen.getByRole("button", { name: /assign token/i }));

    expect(queueService.addPatient).toHaveBeenCalledWith(
      { name: "Mira Sen" },
      expect.anything(),
    );
  });
});
