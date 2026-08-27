"use client";

import { CalendarMonth } from "@/components/worker/CalendarMonth";
import { ColorLegend } from "@/components/worker/ColorLegend";
import { WorkerShell } from "@/components/worker/WorkerShell";
import { useWorkerShifts } from "@/lib/store";

export default function CalendaristicPage() {
  const shifts = useWorkerShifts();

  return (
    <WorkerShell title="Calendaristic">
      <ColorLegend />
      <CalendarMonth shifts={shifts} />
    </WorkerShell>
  );
}
