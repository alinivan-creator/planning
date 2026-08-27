"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import type { Worker } from "@/lib/types";

export function EmployeeDropCard({ worker }: { worker: Worker }) {
  const { assignPersonalFile } = useStore();
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    try {
      await assignPersonalFile(worker, file);
      setStatus(`${file.name} a ajuns în dosarul privat.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Eroare la încărcare");
    }
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        void handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col rounded-2xl border-2 border-dashed p-4 transition-colors",
        active
          ? "border-[#0284c7] bg-sky-50"
          : "border-slate-200 bg-white hover:border-[#0284c7]/60",
      )}
    >
      <span className="text-sm font-semibold text-slate-800">{worker.name}</span>
      <span className="text-xs text-slate-500">
        {worker.role} · {worker.location}
      </span>
      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#0284c7]">
        <Upload className="h-3.5 w-3.5" />
        Drag & drop fișier aici
      </span>
      {status ? <span className="mt-2 text-[11px] text-emerald-700">{status}</span> : null}
      <input
        type="file"
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
