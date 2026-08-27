"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { formatLongDate, todayISO } from "@/lib/dates";
import { useScopedHrDocuments, useStore } from "@/lib/store";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0284c7]";

export function DocumentManager() {
  const { visibleWorkers, addDocument, removeDocument } = useStore();
  const documents = useScopedHrDocuments();
  const [workerId, setWorkerId] = useState(visibleWorkers[0]?.id ?? "");
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState(todayISO());
  const [alertDays, setAlertDays] = useState(30);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    addDocument({
      workerId,
      name: name.trim(),
      expiryDate,
      alertDays: Number(alertDays) || 30,
    });
    setName("");
  }

  useEffect(() => {
    if (!visibleWorkers.some((worker) => worker.id === workerId)) {
      setWorkerId(visibleWorkers[0]?.id ?? "");
    }
  }, [visibleWorkers, workerId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-800">Adaugă document</h2>
        <p className="mt-1 text-sm text-slate-500">
          Nume, dată de expirare și pragul de alertă. Fără încărcări sau validări extra.
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
          Nume document
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Autorizație stivuitor"
            className={inputClass}
          />
        </label>

        <label className="mt-3 block text-sm text-slate-600">
          Dată expirare
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mt-3 block text-sm text-slate-600">
          Alertă cu câte zile înainte
          <input
            type="number"
            min={0}
            value={alertDays}
            onChange={(e) => setAlertDays(Number(e.target.value))}
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-[#0284c7] py-2.5 text-sm font-semibold text-white"
        >
          Salvează documentul
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Documente înregistrate</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {documents.map((doc) => {
            const worker = visibleWorkers.find((item) => item.id === doc.workerId);
            return (
              <li key={doc.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-500">
                    {worker?.name} · expiră {formatLongDate(doc.expiryDate)} · alertă{" "}
                    {doc.alertDays} zile
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
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
