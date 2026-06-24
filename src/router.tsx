import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/reception" replace /> },
      {
        path: "/reception",
        lazy: async () => {
          const { ReceptionPage } = await import("@/pages/ReceptionPage");
          return { Component: ReceptionPage };
        },
      },
      {
        path: "/waiting-room",
        lazy: async () => {
          const { WaitingRoomPage } = await import("@/pages/WaitingRoomPage");
          return { Component: WaitingRoomPage };
        },
      },
      {
        path: "/doctor",
        lazy: async () => {
          const { DoctorPage } = await import("@/pages/DoctorPage");
          return { Component: DoctorPage };
        },
      },
    ],
  },
]);
