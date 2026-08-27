"use client";

import { WorkerInbox } from "@/components/worker/WorkerInbox";
import { WorkerShell } from "@/components/worker/WorkerShell";

export default function InformaPage() {
  return (
    <WorkerShell title="A informa">
      <WorkerInbox />
    </WorkerShell>
  );
}
