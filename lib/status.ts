import type { ShiftStatus } from "./types";

export const STATUS_LABELS: Record<ShiftStatus, string> = {
  shift: "Tură",
  medical: "Concediu medical",
  vacation: "Concediu de odihnă",
  unexcused: "Nemotivat",
};

export const STATUS_STYLES: Record<ShiftStatus, string> = {
  shift: "bg-orange-500 text-white shadow-sm",
  medical: "bg-rose-500/20 text-rose-900 ring-1 ring-inset ring-rose-400/40",
  vacation: "bg-blue-500/20 text-blue-900 ring-1 ring-inset ring-blue-400/40",
  unexcused: "bg-red-500/20 text-red-900 ring-1 ring-inset ring-red-400/40",
};

export const STATUS_DOT: Record<ShiftStatus, string> = {
  shift: "bg-orange-500",
  medical: "bg-rose-400",
  vacation: "bg-blue-400",
  unexcused: "bg-red-500",
};

export const GRID_START = 6;
export const GRID_END = 19;
export const HOUR_PX = 42;
