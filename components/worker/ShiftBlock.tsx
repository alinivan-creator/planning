"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { GRID_START, HOUR_PX, STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import { timeToHours } from "@/lib/dates";
import type { Shift } from "@/lib/types";

export function ShiftBlock({ shift }: { shift: Shift }) {
  const start = timeToHours(shift.start);
  const end = timeToHours(shift.end);
  const spansMidnight = end <= start;
  const duration = spansMidnight ? 24 - start + end : end - start;
  const top = (start - GRID_START) * HOUR_PX;
  const height = Math.max(duration * HOUR_PX, HOUR_PX * 1.4);

  return (
    <article
      className={cn(
        "absolute inset-x-0.5 z-10 overflow-hidden rounded-md px-1 py-1 text-[10px] leading-tight",
        STATUS_STYLES[shift.status],
      )}
      style={{ top, height }}
      title={`${shift.label} · ${shift.start}–${shift.end} · ${shift.location}`}
    >
      <div className="font-semibold">{shift.start}</div>
      <div className="mt-0.5 truncate font-medium">
        {shift.status === "shift" ? shift.label : STATUS_LABELS[shift.status]}
      </div>
      {shift.status === "shift" && shift.location !== "—" ? (
        <div className="mt-0.5 truncate opacity-90">{shift.location}</div>
      ) : null}
      {shift.confirmed ? (
        <Check className="absolute right-0.5 top-1 h-3.5 w-3.5" strokeWidth={3} />
      ) : null}
      <div className="absolute bottom-1 left-1 font-semibold">{shift.end}</div>
    </article>
  );
}
