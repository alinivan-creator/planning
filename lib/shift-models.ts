import type {
  PreferredShift,
  RotationModel,
  ScheduleFlag,
  ShiftCode,
} from "./types";

export const NAMED_SHIFTS: Record<
  ShiftCode,
  { code: ShiftCode; name: string; short: string; start: string; end: string }
> = {
  sc1: { code: "sc1", name: "Schimbul 1", short: "Sc.1", start: "06:00", end: "14:00" },
  sc2: { code: "sc2", name: "Schimbul 2", short: "Sc.2", start: "14:00", end: "22:00" },
  sc3: { code: "sc3", name: "Schimbul 3", short: "Sc.3", start: "22:00", end: "06:00" },
  day12: { code: "day12", name: "12h zi", short: "12Z", start: "07:00", end: "19:00" },
  night12: { code: "night12", name: "12h noapte", short: "12N", start: "19:00", end: "07:00" },
};

export const ROTATION_MODELS: {
  id: RotationModel;
  title: string;
  subtitle: string;
  chips: string[];
}[] = [
  {
    id: "combined_2_2_2_2",
    title: "Ture rotative combinate",
    subtitle: "2 zile Sc.1, 2 zile Sc.2, 2 zile Sc.3, 2 zile liber",
    chips: ["Sc.1", "Sc.1", "Sc.2", "Sc.2", "Sc.3", "Sc.3", "Liber", "Liber"],
  },
  {
    id: "regime_12_24_12_48",
    title: "Regim 12/24 cu 12/48",
    subtitle: "12h zi, 24h pauză, 12h noapte, 48h pauză",
    chips: ["12h zi", "12h noapte", "Liber", "Liber"],
  },
  {
    id: "fixed_sc1",
    title: "Doar Schimbul 1",
    subtitle: "Tură fixă unică — fără rotație",
    chips: ["Sc.1"],
  },
  {
    id: "fixed_sc2",
    title: "Doar Schimbul 2",
    subtitle: "Tură fixă unică — fără rotație",
    chips: ["Sc.2"],
  },
  {
    id: "fixed_sc3",
    title: "Doar Schimbul 3",
    subtitle: "Exclusiv noapte — rotația automată este oprită",
    chips: ["Sc.3"],
  },
];

export const PREFERRED_SHIFT_OPTIONS: { id: import("./types").PreferredShift; label: string }[] = [
  { id: "rotating", label: "Rotativ (urmează modelul echipei)" },
  { id: "fixed_sc1", label: "Program fix — Schimbul 1" },
  { id: "fixed_sc2", label: "Program fix — Schimbul 2" },
  { id: "fixed_sc3", label: "Program fix — Schimbul 3" },
  { id: "night_exclusive", label: "Exclusiv noapte (Sc.3)" },
];

export function patternForModel(model: RotationModel): Array<ShiftCode | "off"> {
  switch (model) {
    case "combined_2_2_2_2":
      return ["sc1", "sc1", "sc2", "sc2", "sc3", "sc3", "off", "off"];
    case "regime_12_24_12_48":
      return ["day12", "night12", "off", "off"];
    case "fixed_sc1":
      return ["sc1"];
    case "fixed_sc2":
      return ["sc2"];
    case "fixed_sc3":
      return ["sc3"];
  }
}

export function cellTone(code: ShiftCode | "off"): string {
  if (code === "off") return "bg-slate-100 text-slate-400";
  if (code === "sc1") return "bg-sky-600 text-white";
  if (code === "sc2") return "bg-orange-500 text-white";
  if (code === "sc3") return "bg-indigo-700 text-white";
  if (code === "day12") return "bg-amber-500 text-white";
  return "bg-slate-800 text-white";
}

export function flagsFromPreferred(preferred: PreferredShift): {
  scheduleFlag: ScheduleFlag;
  fixedShiftCode: ShiftCode | null;
} {
  if (preferred === "night_exclusive") {
    return { scheduleFlag: "night_exclusive", fixedShiftCode: "sc3" };
  }
  if (preferred === "fixed_sc1") {
    return { scheduleFlag: "fixed", fixedShiftCode: "sc1" };
  }
  if (preferred === "fixed_sc2") {
    return { scheduleFlag: "fixed", fixedShiftCode: "sc2" };
  }
  if (preferred === "fixed_sc3") {
    return { scheduleFlag: "fixed", fixedShiftCode: "sc3" };
  }
  return { scheduleFlag: "none", fixedShiftCode: null };
}

export function preferredShiftLabel(preferred: PreferredShift): string {
  return PREFERRED_SHIFT_OPTIONS.find((item) => item.id === preferred)?.label ?? preferred;
}

export function shortCellLabel(code: ShiftCode | "off"): string {
  if (code === "off") return "L";
  return NAMED_SHIFTS[code].short;
}

export function isScheduleLocked(preferred: PreferredShift, flag: ScheduleFlag): boolean {
  return flag === "night_exclusive" || flag === "fixed" || preferred !== "rotating";
}
