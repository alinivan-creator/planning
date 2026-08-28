"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { GRID_START, HOUR_PX, STATUS_LABELS, shiftTone } from "@/lib/status";
import { timeToHours } from "@/lib/dates";
import type { Shift } from "@/lib/types";

const BLOCK_BASE =
  "absolute inset-x-1 z-10 flex flex-col justify-between items-center text-center overflow-hidden rounded-lg p-1.5 shadow-md";

function TimeChip({ value }: { value: string }) {
  return (
    <div className="flex w-full shrink-0 justify-center">
      <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-bold leading-none">
        {value}
      </span>
    </div>
  );
}

export function ShiftBlock({ shift }: { shift: Shift }) {
  const start = timeToHours(shift.start);
  const end = timeToHours(shift.end);
  const spansMidnight = end <= start;
  const duration = spansMidnight ? 24 - start + end : end - start;
  const top = (start - GRID_START) * HOUR_PX;
  const height = Math.max(duration * HOUR_PX, HOUR_PX * 1.4);

  if (shift.status !== "shift") {
    return (
      <article
        className={cn(BLOCK_BASE, "top-1 justify-center", shiftTone(shift))}
        title={STATUS_LABELS[shift.status]}
      >
        <span className="text-[10px] font-semibold leading-tight">
          {STATUS_LABELS[shift.status]}
        </span>
      </article>
    );
  }

  return (
    <article
      className={cn(BLOCK_BASE, shiftTone(shift))}
      style={{ top, height }}
      title={`${shift.label} · ${shift.start}–${shift.end} · ${shift.location}`}
    >
      {shift.confirmed ? (
        <Check className="pointer-events-none absolute right-1 top-1 h-3 w-3" strokeWidth={3} />
      ) : null}

      <TimeChip value={shift.start} />

      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-0.5">
        <span className="line-clamp-2 w-full text-center text-[10px] font-semibold leading-tight">
          {shift.label}
        </span>
        {shift.location !== "—" ? (
          <span className="w-full truncate text-center text-[9px] opacity-90">{shift.location}</span>
        ) : null}
      </div>

      <TimeChip value={shift.end} />
    </article>
  );
}
