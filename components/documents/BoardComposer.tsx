"use client";

import { useState } from "react";
import { canPostCompanyBoard, canPostDepartmentBoard } from "@/lib/rbac";
import { useStore } from "@/lib/store";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0284c7]";

export function BoardComposer({
  scope,
}: {
  scope: "department" | "company";
}) {
  const { currentUser, state, postBoard } = useStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [departmentId, setDepartmentId] = useState(
    currentUser?.departmentId ?? state.departments[0]?.id ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!currentUser) return null;

  const allowed =
    scope === "company"
      ? canPostCompanyBoard(currentUser)
      : canPostDepartmentBoard(
          currentUser,
          currentUser.role === "admin" ? departmentId : currentUser.departmentId ?? "",
        );

  if (!allowed) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      await postBoard({
        scope,
        departmentId: scope === "department" ? departmentId : null,
        title,
        body,
        file,
      });
      setTitle("");
      setBody("");
      setFile(null);
      setMessage("Publicat pe avizier.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Eroare");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">
        {scope === "company" ? "Postează pe avizierul companiei" : "Postează pe avizierul departamentului"}
      </h3>
      {scope === "department" && currentUser.role === "admin" ? (
        <label className="mt-3 block text-sm text-slate-600">
          Departament
          <select
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            className={inputClass}
          >
            {state.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="mt-3 block text-sm text-slate-600">
        Titlu
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          placeholder={scope === "company" ? "ex. Meniu cantină" : "ex. Anunț echipă"}
        />
      </label>
      <label className="mt-3 block text-sm text-slate-600">
        Mesaj
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-sm text-slate-600">
        Fișier (opțional)
        <input
          type="file"
          className="mt-1 block w-full text-sm"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <button
        type="submit"
        className="mt-4 rounded-md bg-[#0284c7] px-4 py-2 text-sm font-semibold text-white"
      >
        Publică
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
    </form>
  );
}
