"use client";

import { FileText, Globe, Trash2, UserRound } from "lucide-react";
import { formatLongDate } from "@/lib/dates";
import { canRemoveDistributed } from "@/lib/rbac";
import { useStore } from "@/lib/store";
import type { DistributedDocument } from "@/lib/types";

const SCOPE_LABEL = {
  personal: "Dosar personal",
  department: "Avizier departament",
  company: "Avizier companie",
} as const;

export function DistributedDocCard({
  doc,
  uploaderName,
}: {
  doc: DistributedDocument;
  uploaderName?: string;
}) {
  const { currentUser, removeDistributed } = useStore();
  const canDelete = currentUser ? canRemoveDistributed(currentUser, doc) : false;
  const date = doc.uploadedAt.slice(0, 10);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0284c7]">
          {doc.scope === "company" ? (
            <Globe className="h-4 w-4" />
          ) : doc.scope === "personal" ? (
            <UserRound className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {SCOPE_LABEL[doc.scope]}
          </p>
          <h3 className="text-sm font-semibold text-slate-800">{doc.title}</h3>
          {doc.body ? <p className="mt-1 text-sm text-slate-600">{doc.body}</p> : null}
          {doc.fileName ? (
            doc.dataUrl ? (
              <a
                href={doc.dataUrl}
                download={doc.fileName}
                className="mt-2 inline-block text-xs font-semibold text-[#0284c7]"
              >
                Descarcă {doc.fileName}
              </a>
            ) : (
              <p className="mt-2 text-xs text-slate-500">{doc.fileName}</p>
            )
          ) : null}
          <p className="mt-2 text-[11px] text-slate-400">
            {uploaderName ? `${uploaderName} · ` : ""}
            {formatLongDate(date)}
          </p>
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={() => removeDistributed(doc.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Șterge documentul"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
