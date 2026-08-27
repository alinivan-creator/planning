"use client";

import { EmployeeDropCard } from "./EmployeeDropCard";
import { BoardComposer } from "./BoardComposer";
import { DistributedDocCard } from "./DistributedDocCard";
import { canPostCompanyBoard } from "@/lib/rbac";
import { useStore } from "@/lib/store";

export function DocumentDistributionPanel() {
  const { currentUser, visibleWorkers, state, departmentDocs, companyDocs } = useStore();
  if (!currentUser) return null;

  const uploader = (id: string) => state.users.find((user) => user.id === id)?.name;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section>
        <h2 className="text-base font-semibold text-slate-800">
          Distribuție personală — drag & drop
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Fișierul ajunge exclusiv în dosarul privat al angajatului, nu în avizierul echipei.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleWorkers.filter((worker) => worker.active).map((worker) => (
            <EmployeeDropCard key={worker.id} worker={worker} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <BoardComposer scope="department" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Avizier departament</h3>
            {departmentDocs.length === 0 ? (
              <p className="text-sm text-slate-400">Niciun anunț de departament.</p>
            ) : (
              departmentDocs.map((doc) => (
                <DistributedDocCard
                  key={doc.id}
                  doc={doc}
                  uploaderName={uploader(doc.uploadedById)}
                />
              ))
            )}
          </div>
        </div>
        <div className="space-y-3">
          {canPostCompanyBoard(currentUser) ? <BoardComposer scope="company" /> : null}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">Avizierul global al companiei</h3>
            <p className="text-xs text-slate-500">
              Vizibil pentru toți utilizatorii din firmă.
            </p>
            {companyDocs.map((doc) => (
              <DistributedDocCard
                key={doc.id}
                doc={doc}
                uploaderName={uploader(doc.uploadedById)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
