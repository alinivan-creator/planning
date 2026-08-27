"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { AlertCard } from "@/components/worker/AlertCard";
import { DistributedDocCard } from "@/components/documents/DistributedDocCard";
import { useStore } from "@/lib/store";

type Tab = "alerts" | "personal" | "department" | "company";

export function WorkerInbox() {
  const { workerAlerts, personalDocs, departmentDocs, companyDocs, state } = useStore();
  const [tab, setTab] = useState<Tab>("alerts");

  const uploader = (id: string) => state.users.find((user) => user.id === id)?.name;

  const items = useMemo(() => {
    if (tab === "alerts") return workerAlerts;
    if (tab === "personal") return personalDocs;
    if (tab === "department") return departmentDocs;
    return companyDocs;
  }, [tab, workerAlerts, personalDocs, departmentDocs, companyDocs]);

  return (
    <div className="px-3 pb-8">
      <p className="mb-3 text-sm text-slate-500">
        Inbox personal, avizier de departament și avizier global — fără vizibilitate către colegi.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["alerts", `Alerte (${workerAlerts.length})`],
            ["personal", `Dosar (${personalDocs.length})`],
            ["department", `Departament (${departmentDocs.length})`],
            ["company", `Companie (${companyDocs.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              tab === id ? "bg-[#0284c7] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
          <Inbox className="h-8 w-8" />
          <p className="text-sm">Nimic în această secțiune.</p>
        </div>
      ) : tab === "alerts" ? (
        <ul className="space-y-3">
          {workerAlerts.map((alert) => (
            <li key={alert.id}>
              <AlertCard alert={alert} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {(tab === "personal"
            ? personalDocs
            : tab === "department"
              ? departmentDocs
              : companyDocs
          ).map((doc) => (
            <li key={doc.id}>
              <DistributedDocCard doc={doc} uploaderName={uploader(doc.uploadedById)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
