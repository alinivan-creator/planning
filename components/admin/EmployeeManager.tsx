"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, UserMinus, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { canManageWorker } from "@/lib/rbac";
import { useStore } from "@/lib/store";
import {
  PREFERRED_SHIFT_OPTIONS,
  flagsFromPreferred,
  preferredShiftLabel,
} from "@/lib/shift-models";
import type { PreferredShift, Worker } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/15";

type FormState = {
  name: string;
  email: string;
  role: string;
  departmentId: string;
  preferredShift: PreferredShift;
};

function emptyForm(departmentId: string): FormState {
  return {
    name: "",
    email: "",
    role: "",
    departmentId,
    preferredShift: "rotating",
  };
}

function fromWorker(worker: Worker): FormState {
  return {
    name: worker.name,
    email: worker.email,
    role: worker.role,
    departmentId: worker.departmentId,
    preferredShift: worker.preferredShift,
  };
}

export function EmployeeManager() {
  const {
    currentUser,
    visibleWorkers,
    state,
    addEmployee,
    updateEmployee,
    deactivateEmployee,
    activateEmployee,
    removeEmployee,
  } = useStore();

  const defaultDepartmentId =
    currentUser?.role === "supervisor"
      ? currentUser.departmentId ?? state.departments[0]?.id ?? ""
      : state.departments[0]?.id ?? "";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(defaultDepartmentId));
  const [error, setError] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const departments =
    currentUser?.role === "supervisor"
      ? state.departments.filter((item) => item.id === currentUser.departmentId)
      : state.departments;

  const sorted = useMemo(
    () =>
      [...visibleWorkers].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return a.name.localeCompare(b.name, "ro");
      }),
    [visibleWorkers],
  );

  const editing = editingId
    ? visibleWorkers.find((worker) => worker.id === editingId)
    : null;
  const panelOpen = creating || Boolean(editing);

  function openCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(emptyForm(defaultDepartmentId));
    setError(null);
    setConfirmRemoveId(null);
  }

  function openEdit(worker: Worker) {
    setCreating(false);
    setEditingId(worker.id);
    setForm(fromWorker(worker));
    setError(null);
    setConfirmRemoveId(null);
  }

  function closePanel() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      setError("Completează numele, emailul și rolul.");
      return;
    }
    if (creating) {
      const created = addEmployee(form);
      if (!created) {
        setError("Nu s-a putut adăuga. Verifică emailul (unic) și departamentul.");
        return;
      }
      closePanel();
      return;
    }
    if (editingId) {
      updateEmployee(editingId, form);
      closePanel();
    }
  }

  const flags = flagsFromPreferred(form.preferredShift);
  const locked = flags.scheduleFlag !== "none";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0284c7]">
            Resurse umane
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Managementul angajaților
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Adaugă, editează sau dezactivează personalul. Tipul de tură preferat
            blochează rotația automată pentru program fix sau exclusiv noapte.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0369a1]"
        >
          <Plus className="h-4 w-4" />
          Angajat nou
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
            <Users className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">
              {sorted.length} persoane în scop
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">Angajat</th>
                  <th className="px-3 py-3">Rol</th>
                  <th className="px-3 py-3">Hală</th>
                  <th className="px-3 py-3">Tip tură</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((worker) => (
                  <tr
                    key={worker.id}
                    className={cn(
                      "border-t border-slate-100",
                      !worker.active && "bg-slate-50/80 text-slate-400",
                    )}
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{worker.name}</p>
                      <p className="text-xs text-slate-500">{worker.email}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{worker.role}</td>
                    <td className="px-3 py-3 text-slate-600">{worker.location}</td>
                    <td className="px-3 py-3">
                      <ShiftBadge worker={worker} />
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          worker.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-200 text-slate-600",
                        )}
                      >
                        {worker.active ? "Activ" : "Dezactivat"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {currentUser && canManageWorker(currentUser, worker) ? (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(worker)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            aria-label="Editează"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {worker.active ? (
                            <button
                              type="button"
                              onClick={() => deactivateEmployee(worker.id)}
                              className="rounded-md p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
                              aria-label="Dezactivează"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => activateEmployee(worker.id)}
                              className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                              aria-label="Reactivează"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {panelOpen ? (
          <form
            onSubmit={submit}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-800">
              {creating ? "Angajat nou" : "Editează angajatul"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Datele de bază și preferința de tură, folosite de motorul de rotație.
            </p>

            <label className="mt-4 block text-sm text-slate-600">
              Nume
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                autoComplete="name"
              />
            </label>
            <label className="mt-3 block text-sm text-slate-600">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                autoComplete="email"
              />
            </label>
            <label className="mt-3 block text-sm text-slate-600">
              Rol
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="ex. Operator logistică"
                className={inputClass}
              />
            </label>
            <label className="mt-3 block text-sm text-slate-600">
              Departament / Hală
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
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
            <label className="mt-3 block text-sm text-slate-600">
              Tip de tură preferat
              <select
                value={form.preferredShift}
                onChange={(e) =>
                  setForm({
                    ...form,
                    preferredShift: e.target.value as PreferredShift,
                  })
                }
                className={inputClass}
              >
                {PREFERRED_SHIFT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {locked ? (
              <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
                {flags.scheduleFlag === "night_exclusive"
                  ? "Flag: Exclusiv noapte — rotația automată este oprită, se aplică doar Sc.3."
                  : "Flag: Program fix — rotația automată este oprită pentru acest angajat."}
              </p>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Urmează modelul de rotație al echipei sau al calculatorului.
              </p>
            )}

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#0284c7] px-4 py-2 text-sm font-semibold text-white"
              >
                {creating ? "Salvează angajatul" : "Actualizează"}
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                Anulează
              </button>
            </div>

            {editing && !creating ? (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Eliminare
                </p>
                {confirmRemoveId === editing.id ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-red-700">
                      Ștergere definitivă a lui {editing.name}, inclusiv turele și
                      documentele personale.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          removeEmployee(editing.id);
                          closePanel();
                        }}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Confirmă ștergerea
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600"
                      >
                        Renunță
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveId(editing.id)}
                    className="mt-2 text-sm font-medium text-red-600 hover:underline"
                  >
                    Elimină din sistem
                  </button>
                )}
              </div>
            ) : null}
          </form>
        ) : (
          <aside className="h-fit rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-500">
            Selectează un angajat pentru editare sau apasă „Angajat nou”.
            Supervizorul vede doar hala proprie.
          </aside>
        )}
      </div>
    </div>
  );
}

function ShiftBadge({ worker }: { worker: Worker }) {
  if (worker.scheduleFlag === "night_exclusive") {
    return (
      <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
        Exclusiv noapte
      </span>
    );
  }
  if (worker.scheduleFlag === "fixed") {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
        Program fix
      </span>
    );
  }
  return (
    <span className="text-xs text-slate-500">
      {preferredShiftLabel(worker.preferredShift)}
    </span>
  );
}
