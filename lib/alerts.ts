import { diffDays, todayISO } from "./dates";
import type { Appointment, DocumentRecord, InboxAlert } from "./types";

function daysPhrase(daysUntil: number): string {
  if (daysUntil < 0) {
    const n = Math.abs(daysUntil);
    return n === 1 ? "a expirat ieri" : `a expirat acum ${n} zile`;
  }
  if (daysUntil === 0) return "expiră astăzi";
  if (daysUntil === 1) return "expiră mâine";
  return `expiră în ${daysUntil} zile`;
}

export function buildInboxAlerts(
  documents: DocumentRecord[],
  appointments: Appointment[],
  now = new Date(),
): InboxAlert[] {
  const today = todayISO(now);
  const alerts: InboxAlert[] = [];

  for (const doc of documents) {
    const daysUntil = diffDays(today, doc.expiryDate);
    if (daysUntil > doc.alertDays) continue;

    alerts.push({
      id: `doc-${doc.id}`,
      kind: "document",
      icon: "warning",
      title: doc.name,
      message: `Autorizația ${daysPhrase(daysUntil)}`,
      workerId: doc.workerId,
      relatedDate: doc.expiryDate,
      daysUntil,
    });
  }

  for (const appointment of appointments) {
    const daysUntil = diffDays(today, appointment.date);
    // Disappears completely once the employer-entered appointment date has passed.
    if (daysUntil < 0) continue;

    const kindLabel =
      appointment.type === "ssm" ? "Programare SSM" : "Programare medicală";

    alerts.push({
      id: `apt-${appointment.id}`,
      kind: "appointment",
      icon: "exclamation",
      title: appointment.title,
      message:
        daysUntil === 0
          ? `${kindLabel} este astăzi`
          : daysUntil === 1
            ? `${kindLabel} este mâine`
            : `${kindLabel} în ${daysUntil} zile`,
      workerId: appointment.workerId,
      relatedDate: appointment.date,
      daysUntil,
    });
  }

  return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function alertsForWorker(
  alerts: InboxAlert[],
  workerId: string,
): InboxAlert[] {
  return alerts.filter((alert) => alert.workerId === workerId);
}
