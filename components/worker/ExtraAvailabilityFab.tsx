"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { todayISO } from "@/lib/dates";
import { useStore } from "@/lib/store";

export function ExtraAvailabilityFab() {
  const { currentUser, addExtraAvailability } = useStore();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("22:00");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!currentUser) return;
    addExtraAvailability({
      workerId: currentUser.id,
      date,
      start,
      end,
    });
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-md bg-[#0284c7] px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Extra disponibilitate
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center">
          <form
            onSubmit={submit}
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">
                Extra disponibilitate
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Închide">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <label className="mb-3 block text-sm text-slate-600">
              Data
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-800"
              />
            </label>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-600">
                De la
                <input
                  type="time"
                  required
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
              <label className="text-sm text-slate-600">
                Până la
                <input
                  type="time"
                  required
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-[#0284c7] py-2.5 text-sm font-semibold text-white"
            >
              Salvează
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
