import type {
  Appointment,
  DistributedDocument,
  DocumentRecord,
  Shift,
  User,
  Worker,
} from "./types";

export const SESSION_COOKIE = "turaplan_uid";

export function isStaff(user: User): boolean {
  return user.role === "supervisor" || user.role === "admin";
}

export function canAccessWorkerPortal(user: User): boolean {
  return user.role === "worker";
}

export function canAccessAdmin(user: User): boolean {
  return isStaff(user);
}

export function visibleWorkers(actor: User, workers: Worker[]): Worker[] {
  if (actor.role === "admin") return workers;
  if (actor.role === "supervisor") {
    return workers.filter((worker) => worker.departmentId === actor.departmentId);
  }
  return workers.filter((worker) => worker.id === actor.id);
}

export function canViewWorkerData(actor: User, workerId: string, workers: Worker[]): boolean {
  return visibleWorkers(actor, workers).some((worker) => worker.id === workerId);
}

export function canManageWorker(actor: User, worker: Worker): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "supervisor") {
    return worker.departmentId === actor.departmentId;
  }
  return false;
}

export function canAssignPersonalDocument(actor: User, recipient: Worker): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "supervisor") {
    return recipient.departmentId === actor.departmentId;
  }
  return false;
}

export function canPostDepartmentBoard(actor: User, departmentId: string): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "supervisor") {
    return actor.departmentId === departmentId;
  }
  return false;
}

export function canPostCompanyBoard(actor: User): boolean {
  return actor.role === "admin";
}

export function canRemoveDistributed(actor: User, doc: DistributedDocument): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "supervisor") {
    if (doc.scope === "company") return false;
    return doc.departmentId === actor.departmentId && doc.uploadedById === actor.id;
  }
  return false;
}

export function visibleShifts(actor: User, shifts: Shift[], workers: Worker[]): Shift[] {
  const allowed = new Set(visibleWorkers(actor, workers).map((worker) => worker.id));
  return shifts.filter((shift) => allowed.has(shift.workerId));
}

export function visibleHrDocuments(
  actor: User,
  documents: DocumentRecord[],
  workers: Worker[],
): DocumentRecord[] {
  const allowed = new Set(visibleWorkers(actor, workers).map((worker) => worker.id));
  return documents.filter((doc) => allowed.has(doc.workerId));
}

export function visibleAppointments(
  actor: User,
  appointments: Appointment[],
  workers: Worker[],
): Appointment[] {
  const allowed = new Set(visibleWorkers(actor, workers).map((worker) => worker.id));
  return appointments.filter((item) => allowed.has(item.workerId));
}

export function visibleDistributedDocuments(
  actor: User,
  docs: DistributedDocument[],
): DistributedDocument[] {
  return docs.filter((doc) => {
    if (doc.scope === "company") return true;
    if (doc.scope === "department") {
      if (actor.role === "admin") return true;
      return doc.departmentId === actor.departmentId;
    }
    if (actor.role === "admin") return true;
    if (actor.role === "supervisor") {
      return doc.departmentId === actor.departmentId;
    }
    return doc.recipientUserId === actor.id;
  });
}

export function personalDocumentsFor(
  actor: User,
  docs: DistributedDocument[],
): DistributedDocument[] {
  return visibleDistributedDocuments(actor, docs).filter(
    (doc) => doc.scope === "personal" && doc.recipientUserId === actor.id,
  );
}

export function departmentDocumentsFor(
  actor: User,
  docs: DistributedDocument[],
): DistributedDocument[] {
  return visibleDistributedDocuments(actor, docs).filter(
    (doc) => doc.scope === "department",
  );
}

export function companyDocumentsFor(
  actor: User,
  docs: DistributedDocument[],
): DistributedDocument[] {
  return visibleDistributedDocuments(actor, docs).filter(
    (doc) => doc.scope === "company",
  );
}

export function homePathFor(user: User): string {
  if (user.role === "worker") return "/prezentare";
  return "/admin";
}

export function roleLabel(role: User["role"]): string {
  if (role === "admin") return "Admin";
  if (role === "supervisor") return "Supervisor";
  return "Angajat";
}
