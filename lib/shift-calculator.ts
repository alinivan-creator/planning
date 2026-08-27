import { addDaysISO } from "./dates";
import { NAMED_SHIFTS, patternForModel } from "./shift-models";
import type { RotationModel, Shift, ShiftCode, Worker } from "./types";

export interface AdvancedRosterInput {
  model: RotationModel;
  workers: Worker[];
  startDate: string;
  days: number;
  staggerTeam: boolean;
  workerModels?: Record<string, RotationModel>;
}

export interface RosterCell {
  date: string;
  code: ShiftCode | "off";
  locked: boolean;
}

export interface RosterPlanRow {
  worker: Worker;
  locked: boolean;
  model: RotationModel;
  cells: RosterCell[];
}

export function effectivePattern(
  worker: Worker,
  departmentModel: RotationModel,
): { pattern: Array<ShiftCode | "off">; locked: boolean; model: RotationModel } {
  if (worker.scheduleFlag === "night_exclusive" || worker.preferredShift === "night_exclusive") {
    return { pattern: ["sc3"], locked: true, model: "fixed_sc3" };
  }
  if (worker.scheduleFlag === "fixed" || worker.preferredShift.startsWith("fixed_")) {
    const code =
      worker.fixedShiftCode ??
      (worker.preferredShift === "fixed_sc2"
        ? "sc2"
        : worker.preferredShift === "fixed_sc3"
          ? "sc3"
          : "sc1");
    const model: RotationModel =
      code === "sc2" ? "fixed_sc2" : code === "sc3" ? "fixed_sc3" : "fixed_sc1";
    return { pattern: [code], locked: true, model };
  }
  return { pattern: patternForModel(departmentModel), locked: false, model: departmentModel };
}

export function buildRosterPlan(input: AdvancedRosterInput): RosterPlanRow[] {
  const { model, workers, startDate, days, staggerTeam, workerModels } = input;
  if (workers.length === 0 || days <= 0) return [];

  return workers
    .filter((worker) => worker.active)
    .map((worker, workerIndex) => {
      const workerModel = workerModels?.[worker.id] ?? model;
      const { pattern, locked, model: resolvedModel } = effectivePattern(worker, workerModel);
      const offset = !locked && staggerTeam ? workerIndex * 2 : 0;
      const cells: RosterCell[] = [];

      for (let day = 0; day < days; day += 1) {
        cells.push({
          date: addDaysISO(startDate, day),
          code: pattern[(day + offset) % pattern.length],
          locked,
        });
      }

      return { worker, locked, model: resolvedModel, cells };
    });
}

export function generateAdvancedRoster(input: AdvancedRosterInput): Shift[] {
  const shifts: Shift[] = [];

  for (const row of buildRosterPlan(input)) {
    for (const cell of row.cells) {
      if (cell.code === "off") continue;
      const named = NAMED_SHIFTS[cell.code];
      shifts.push({
        id: `gen-${row.worker.id}-${cell.date}-${cell.code}`,
        workerId: row.worker.id,
        date: cell.date,
        start: named.start,
        end: named.end,
        location: row.worker.location,
        label: named.name,
        status: "shift",
        confirmed: true,
        generated: true,
      });
    }
  }

  return shifts;
}
