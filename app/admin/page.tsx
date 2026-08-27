"use client";

import Link from "next/link";
import { Calculator, FileStack, FileText, Users } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AdminHomePage() {
  const { visibleWorkers, scopedAlerts, currentUser, state } = useStore();
  const department = state.departments.find(
    (item) => item.id === currentUser?.departmentId,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <p className="text-sm text-slate-500">
        {currentUser?.role === "admin"
          ? "Vedere globală — toate departamentele."
          : `Acces strict la ${department?.name ?? "departamentul tău"}. Celelalte echipe sunt invizibile.`}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Angajați vizibili" value={visibleWorkers.filter((w) => w.active).length} />
        <Stat label="Alerte în scop" value={scopedAlerts.length} />
        <Stat
          label="Departamente"
          value={currentUser?.role === "admin" ? state.departments.length : 1}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/angajati"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#0284c7]"
        >
          <Users className="h-5 w-5 text-[#0284c7]" />
          <h2 className="mt-3 text-base font-semibold text-slate-800">
            Management angajați
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Adaugă, editează sau dezactivează personalul halei.
          </p>
        </Link>
        <Link
          href="/admin/distribuire"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#0284c7]"
        >
          <FileStack className="h-5 w-5 text-[#0284c7]" />
          <h2 className="mt-3 text-base font-semibold text-slate-800">
            Distribuire documente
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Drag & drop personal, avizier de departament și avizier global.
          </p>
        </Link>
        <Link
          href="/admin/documente"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#0284c7]"
        >
          <FileText className="h-5 w-5 text-[#0284c7]" />
          <h2 className="mt-3 text-base font-semibold text-slate-800">
            Documente și programări
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Expirări și programări medicale/SSM, doar pentru echipa ta.
          </p>
        </Link>
        <Link
          href="/admin/calculator-ture"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#0284c7]"
        >
          <Calculator className="h-5 w-5 text-[#0284c7]" />
          <h2 className="mt-3 text-base font-semibold text-slate-800">
            Calculator de ture
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Generare colectivă sau individuală, cu modele rotative din România.
          </p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
