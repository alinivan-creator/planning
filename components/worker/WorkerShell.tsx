"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { Drawer } from "./Drawer";
import { WorkerHeader } from "./WorkerHeader";

export function WorkerShell({
  title,
  children,
  viewToggle,
}: {
  title: string;
  children: ReactNode;
  viewToggle?: {
    view: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
  };
}) {
  const { inboxBadgeCount } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-[430px] flex-col bg-white shadow-[0_0_40px_rgba(15,23,42,0.08)]">
      <WorkerHeader
        title={title}
        alertCount={inboxBadgeCount}
        onMenu={() => setOpen(true)}
        view={viewToggle?.view}
        onViewChange={viewToggle?.onViewChange}
      />
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        alertCount={inboxBadgeCount}
      />
      <main className="relative flex-1">{children}</main>
      <span className="pointer-events-none absolute right-0 top-1/2 z-20 flex h-14 w-4 -translate-y-1/2 items-center justify-center rounded-l-md bg-amber-700/75 text-white">
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
      </span>
    </div>
  );
}

