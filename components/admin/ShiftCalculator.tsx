"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { DAY_SHORT, addDaysISO, formatDayLabel, todayISO, weekdayIndexMonday } from "@/lib/dates";
import { buildRosterPlan } from "@/lib/shift-calculator";
import {
  ROTATION_MODELS,
  cellTone,
  shortCellLabel,
} from "@/lib/shift-models";
import { useStore } from "@/lib/store";
import type { CycleLength, RotationModel, Worker } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/15";

const PREVIEW_DAYS = 21;

export function ShiftCalculator() {
  const { currentUser, activeWorkers, state, applyGeneratedRoster } = useStore();
  const [model, setModel] = useState<RotationModel>("combined_2_2_2_2");
  const [scope, setScope] = useState<"department" | "individual">("department");
  const [departmentId, setDepartmentId] = useState(
    currentUser?.departmentId ?? state.departments[0]?.id ?? "",
  );
  const [cycle, setCycle] = useState<CycleLength>(21);
  const [staggerTeam, setStaggerTeam] = useState(true);
  const [startDate, setStartDate] = useState(todayISO());
  const [workerIds, setWorkerIds] = useState<string[] | null>(null);
  const [workerModels, setWorkerModels] = useState<Record<string, RotationModel>>({});
  const [previewed, setPreviewed] = useState(false);
  const [applied, setApplied] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const departments =
    currentUser?.role === "supervisor"
      ? state.departments.filter((item) => item.id === currentUser.departmentId)
      : state.departments;

  const scopedWorkers = useMemo(
    () => activeWorkers.filter((worker) => worker.departmentId === departmentId),
    [activeWorkers, departmentId],
  );

  useEffect(() => {
    if (currentUser?.role === "supervisor" && currentUser.departmentId) {
      setDepartmentId(currentUser.departmentId);
    }
  }, [currentUser]);

  useEffect(() => {
    setWorkerIds(scopedWorkers.map((worker) => worker.id));
    setPreviewed(false);
    setApplied(null);
  }, [scopedWorkers]);

  const selectedIds = workerIds ?? scopedWorkers.map((worker) => worker.id);
  const selectedWorkers = scopedWorkers.filter((worker) => selectedIds.includes(worker.id));
  const lockedCount = selectedWorkers.filter(
    (worker) => worker.scheduleFlag !== "none",
  ).length;

  const plan = useMemo(
    () =>
      previewed
        ? buildRosterPlan({
            model,
            workers: selectedWorkers,
            startDate,
            days: PREVIEW_DAYS,
            staggerTeam,
            workerModels: scope === "individual" ? workerModels : undefined,
          })
        : [],
    [previewed, model, selectedWorkers, startDate, staggerTeam, workerModels, scope],
  );

  const dates = useMemo(
    () => Array.from({ length: PREVIEW_DAYS }, (_, day) => addDaysISO(startDate, day)),
    [startDate],
  );

  function toggleWorker(id: string) {
    const current = workerIds ?? scopedWorkers.map((worker) => worker.id);
    setWorkerIds(
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setPreviewed(false);
    setApplied(null);
  }

  function runPreview() {
    if (selectedWorkers.length === 0) {
      setNotice("Selectează cel puțin un angajat activ.");
      return;
    }
    setPreviewed(true);
    setApplied(null);
    setNotice(null);
  }

  function apply() {
    if (!previewed) {
      setNotice("Previzualizează programul înainte de a-l aplica.");
      return;
    }
    const count = applyGeneratedRoster({
      model,
      workerIds: selectedWorkers.map((worker) => worker.id),
      startDate,
      days: PREVIEW_DAYS,
      staggerTeam,
      workerModels: scope === "individual" ? workerModels : undefined,
    });
    setApplied(count);
    setNotice(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0284c7]">
          Motor de calcul
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Calculator avansat de ture
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Configurează rotația pe departament sau pe fiecare muncitor. Flag-urile
          „Exclusiv noapte” și „Program fix” opresc rotația automată.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Model de rotație</h2>
        <p className="mt-1 text-sm text-slate-500">
          Modele native pentru industria din România. Ciclicitatea se aplică pe 7, 14
          sau 21 de zile; previzualizarea arată întotdeauna 3 săptămâni.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ROTATION_MODELS.map((item) => {
            const selected = model === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setModel(item.id);
                  setPreviewed(false);
                  setApplied(null);
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  selected
                    ? "border-[#0284c7] bg-sky-50 ring-2 ring-[#0284c7]/20"
                    : "border-slate-200 hover:border-[#0284c7]/50",
                )}
              >
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.chips.map((chip, index) => (
                    <span
                      key={`${item.id}-${index}`}
                      className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Domeniu de aplicare</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              { id: "department", label: "Colectiv — pe departament" },
              { id: "individual", label: "Individual — pe muncitor" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setScope(item.id);
                setPreviewed(false);
                setApplied(null);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                scope === item.id
                  ? "bg-[#0284c7] text-white"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="text-sm text-slate-600">
            Departament / Hală
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPreviewed(false);
              }}
              className={inputClass}
              disabled={currentUser?.role === "supervisor"}
            >
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Data de start
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPreviewed(false);
                setApplied(null);
              }}
              className={inputClass}
            />
          </label>
          <fieldset className="text-sm text-slate-600">
            <legend className="mb-1">Ciclicitate</legend>
            <div className="mt-1 flex gap-1">
              {([7, 14, 21] as CycleLength[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCycle(value)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-semibold",
                    cycle === value
                      ? "border-[#0284c7] bg-sky-50 text-[#0284c7]"
                      : "border-slate-200 text-slate-600",
                  )}
                >
                  {value} zile
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={staggerTeam}
              onChange={(e) => {
                setStaggerTeam(e.target.checked);
                setPreviewed(false);
                setApplied(null);
              }}
            />
            Decalează echipele (offset 2 zile)
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Ciclul de {cycle} zile este marcat în previzualizare. Aplicarea scrie
          întotdeauna cele 3 săptămâni previzualizate, fără a suprascrie concediile.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">
            {scope === "department" ? "Echipa halei" : "Selectare individuală"}
          </h2>
          <p className="text-xs text-slate-500">
            {selectedWorkers.length} selectați · {lockedCount} cu rotație oprită
          </p>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {scopedWorkers.map((worker) => (
            <WorkerRow
              key={worker.id}
              worker={worker}
              checked={selectedIds.includes(worker.id)}
              individual={scope === "individual"}
              model={workerModels[worker.id] ?? model}
              onToggle={() => toggleWorker(worker.id)}
              onModel={(value) => {
                setWorkerModels((prev) => ({ ...prev, [worker.id]: value }));
                setPreviewed(false);
                setApplied(null);
              }}
            />
          ))}
          {scopedWorkers.length === 0 ? (
            <li className="py-6 text-sm text-slate-400">Niciun angajat activ în acest scop.</li>
          ) : null}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runPreview}
          className="inline-flex items-center gap-2 rounded-lg border border-[#0284c7] bg-white px-4 py-2.5 text-sm font-semibold text-[#0284c7] hover:bg-sky-50"
        >
          <Play className="h-4 w-4" />
          Previzualizează programul pe 3 săptămâni
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={!previewed}
          className="rounded-lg bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Aplică în program
        </button>
        {applied !== null ? (
          <p className="text-sm font-medium text-emerald-700">
            {applied} ture au fost scrise în calendarele individuale.
          </p>
        ) : null}
        {notice ? <p className="text-sm text-amber-700">{notice}</p> : null}
      </div>

      {previewed ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Previzualizare 3 săptămâni
            </h2>
            <p className="text-xs text-slate-500">
              Celulele blocate (lacăt) nu urmează rotația colectivă. Liber = fără tură.
            </p>
          </div>
          <div className="overflow-auto">
            <table className="min-w-max text-center text-[11px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">
                    Angajat
                  </th>
                  {dates.map((date, index) => (
                    <th
                      key={date}
                      className={cn(
                        "min-w-[44px] px-1 py-2 font-medium text-slate-500",
                        index < cycle && "bg-sky-50 text-[#0284c7]",
                        weekdayIndexMonday(date) === 0 && index > 0 && "border-l border-slate-200",
                      )}
                    >
                      <span className="block uppercase">{DAY_SHORT[weekdayIndexMonday(date)]}</span>
                      <span className="block text-[10px] font-normal">
                        {formatDayLabel(date).split(" ")[1]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.map((row) => (
                  <tr key={row.worker.id} className="border-t border-slate-100">
                    <td className="sticky left-0 z-10 bg-white px-3 py-1.5 text-left">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        {row.locked ? <Lock className="h-3 w-3 text-indigo-600" /> : null}
                        {row.worker.name}
                      </span>
                    </td>
                    {row.cells.map((cell, index) => (
                      <td
                        key={cell.date}
                        className={cn(
                          "p-0.5",
                          index < cycle && "bg-sky-50/40",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-8 w-10 items-center justify-center rounded-md text-[10px] font-bold",
                            cellTone(cell.code),
                          )}
                          title={cell.code === "off" ? "Liber" : cell.code}
                        >
                          {shortCellLabel(cell.code)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function WorkerRow({
  worker,
  checked,
  individual,
  model,
  onToggle,
  onModel,
}: {
  worker: Worker;
  checked: boolean;
  individual: boolean;
  model: RotationModel;
  onToggle: () => void;
  onModel: (model: RotationModel) => void;
}) {
  const locked = worker.scheduleFlag !== "none";
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <label className="flex min-w-[220px] flex-1 cursor-pointer items-center gap-3">
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span>
          <span className="block text-sm font-medium text-slate-800">{worker.name}</span>
          <span className="block text-xs text-slate-500">
            {worker.role} · {worker.location}
          </span>
        </span>
      </label>
      {locked ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            worker.scheduleFlag === "night_exclusive"
              ? "bg-indigo-50 text-indigo-800"
              : "bg-amber-50 text-amber-800",
          )}
        >
          <Lock className="h-3 w-3" />
          {worker.scheduleFlag === "night_exclusive" ? "Exclusiv noapte" : "Program fix"}
        </span>
      ) : individual && checked ? (
        <select
          value={model}
          onChange={(e) => onModel(e.target.value as RotationModel)}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
        >
          {ROTATION_MODELS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-slate-400">Rotativ</span>
      )}
    </li>
  );
}
