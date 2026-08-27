"use client";

import { useState } from "react";
import { ExtraAvailabilityFab } from "@/components/worker/ExtraAvailabilityFab";
import { ThreeWeekSchedule } from "@/components/worker/ThreeWeekSchedule";
import { WorkerShell } from "@/components/worker/WorkerShell";
import { useStore, useWorkerShifts } from "@/lib/store";

export function ProgramaView() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { currentUser, state } = useStore();
  const shifts = useWorkerShifts();
  const extra = state.extraAvailability.filter(
    (item) => item.workerId === currentUser?.id,
  );

  return (
    <WorkerShell
      title="Programa mea"
      viewToggle={{ view, onViewChange: setView }}
    >
      <ThreeWeekSchedule shifts={shifts} extra={extra} view={view} />
      <ExtraAvailabilityFab />
    </WorkerShell>
  );
}
