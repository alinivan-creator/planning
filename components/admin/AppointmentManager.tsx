"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { formatLongDate, todayISO } from "@/lib/dates";
import { useScopedAppointments, useStore } from "@/lib/store";
import type { AppointmentType } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0284c7]";

export function AppointmentManager() {
  const { visibleWorkers, addAppointment, removeAppointment } = useStore();
  const appointments = useScopedAppointments();
  const [workerId, setWorkerId] = useState(visibleWorkers[0]?.id ?? "");
  const [type, setType] = useState<AppointmentType>("medical");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addAppointment({
      workerId,
      type,
      title: title.trim(),
      date,
    });
    setTitle("");
  }

  useEffect(() => {
    if (!visibleWorkers.some((worker) => worker.id === workerId)) {
      setWorkerId(visibleWorkers[0]?.id ?? "");
    }
  }, [visibleWorkers, workerId]);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-800">
          Programare medicală / SSM
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Alerta din inbox dispare complet după data introdusă aici.
        </p>

        <label className="mt-4 block text-sm text-slate-600">
          Angajat
          <select
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className={inputClass}
          >
            {visibleWorkers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-sm text-slate-600">
          Tip
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AppointmentType)}
            className={inputClass}
          >
            <option value="medical">Medical</option>
            <option value="ssm">SSM</option>
          </select>
        </label>

        <label className="mt-3 block text-sm text-slate-600">
          Titlu
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. Control medical periodic"
            className={inputClass}
          />
        </label>

        <label className="mt-3 block text-sm text-slate-600">
          Data programării
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-[#0284c7] py-2.5 text-sm font-semibold text-white"
        >
          Salvează programarea
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Programări</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {appointments.map((item) => {
            const worker = visibleWorkers.find((w) => w.id === item.workerId);
            return (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {worker?.name} · {item.type === "ssm" ? "SSM" : "Medical"} ·{" "}
                    {formatLongDate(item.date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAppointment(item.id)}
                  className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Șterge"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
