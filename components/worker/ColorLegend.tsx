"use client";

import { STATUS_DOT, STATUS_LABELS } from "@/lib/status";
import type { ShiftStatus } from "@/lib/types";

const ITEMS: ShiftStatus[] = ["shift", "medical", "vacation", "unexcused"];

export function ColorLegend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 text-[11px] text-slate-600">
      {ITEMS.map((status) => (
        <li key={status} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${STATUS_DOT[status]} ${status !== "shift" ? "opacity-70" : ""}`} />
          {STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  );
}
