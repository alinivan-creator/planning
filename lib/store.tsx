"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { alertsForWorker, buildInboxAlerts } from "./alerts";
import { findDemoUser } from "./auth/users";
import { addDaysISO } from "./dates";
import {
  canAssignPersonalDocument,
  canManageWorker,
  canPostCompanyBoard,
  canPostDepartmentBoard,
  canRemoveDistributed,
  canViewWorkerData,
  companyDocumentsFor,
  departmentDocumentsFor,
  personalDocumentsFor,
  visibleAppointments,
  visibleDistributedDocuments,
  visibleHrDocuments,
  visibleShifts,
  visibleWorkers,
} from "./rbac";
import { seedState } from "./seed";
import { generateAdvancedRoster } from "./shift-calculator";
import { flagsFromPreferred } from "./shift-models";
import type {
  Appointment,
  AppState,
  DistributedDocument,
  DocumentRecord,
  ExtraAvailability,
  InboxAlert,
  PreferredShift,
  RotationModel,
  ShiftTemplate,
  User,
  Worker,
} from "./types";

const STORAGE_KEY = "turaplan-state-v3";

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface StoreValue {
  state: AppState;
  sessionReady: boolean;
  currentUser: User | null;
  visibleWorkers: Worker[];
  activeWorkers: Worker[];
  scopedAlerts: InboxAlert[];
  workerAlerts: InboxAlert[];
  personalDocs: DistributedDocument[];
  departmentDocs: DistributedDocument[];
  companyDocs: DistributedDocument[];
  inboxBadgeCount: number;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  addDocument: (doc: Omit<DocumentRecord, "id">) => void;
  removeDocument: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, "id">) => void;
  removeAppointment: (id: string) => void;
  addExtraAvailability: (item: Omit<ExtraAvailability, "id">) => void;
  applyGeneratedRoster: (input: {
    model: RotationModel;
    workerIds: string[];
    startDate: string;
    days: number;
    staggerTeam: boolean;
    workerModels?: Record<string, RotationModel>;
  }) => number;
  updateTemplate: (template: ShiftTemplate) => void;
  addTemplate: (template: Omit<ShiftTemplate, "id">) => void;
  removeTemplate: (id: string) => void;
  addEmployee: (input: {
    name: string;
    email: string;
    role: string;
    departmentId: string;
    preferredShift: PreferredShift;
  }) => Worker | null;
  updateEmployee: (
    id: string,
    input: {
      name: string;
      email: string;
      role: string;
      departmentId: string;
      preferredShift: PreferredShift;
    },
  ) => void;
  deactivateEmployee: (id: string) => void;
  activateEmployee: (id: string) => void;
  removeEmployee: (id: string) => void;
  assignPersonalFile: (recipient: Worker, file: File, title?: string) => Promise<void>;
  postBoard: (input: {
    scope: "department" | "company";
    departmentId?: string | null;
    title: string;
    body: string;
    file?: File | null;
  }) => Promise<void>;
  removeDistributed: (id: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(): string {
  return crypto.randomUUID();
}

function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.users || !parsed.distributedDocuments) return null;
    if (!parsed.workers?.every((worker) => typeof worker.preferredShift === "string")) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function StoreProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [state, setState] = useState<AppState>(seedState);
  const [hydrated, setHydrated] = useState(false);
  const [sessionReady] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const team = useMemo(
    () => (currentUser ? visibleWorkers(currentUser, state.workers) : []),
    [currentUser, state.workers],
  );

  const activeTeam = useMemo(() => team.filter((worker) => worker.active), [team]);

  const alerts = useMemo(
    () => buildInboxAlerts(state.documents, state.appointments),
    [state.documents, state.appointments],
  );

  const scopedAlerts = useMemo(() => {
    if (!currentUser) return [];
    const allowed = new Set(team.map((worker) => worker.id));
    return alerts.filter((alert) => allowed.has(alert.workerId));
  }, [alerts, currentUser, team]);

  const workerAlerts = useMemo(() => {
    if (!currentUser) return [];
    return alertsForWorker(alerts, currentUser.id);
  }, [alerts, currentUser]);

  const personalDocs = useMemo(() => {
    if (!currentUser) return [];
    return personalDocumentsFor(currentUser, state.distributedDocuments);
  }, [currentUser, state.distributedDocuments]);

  const departmentDocs = useMemo(() => {
    if (!currentUser) return [];
    return departmentDocumentsFor(currentUser, state.distributedDocuments);
  }, [currentUser, state.distributedDocuments]);

  const companyDocs = useMemo(() => {
    if (!currentUser) return [];
    return companyDocumentsFor(currentUser, state.distributedDocuments);
  }, [currentUser, state.distributedDocuments]);

  const inboxBadgeCount = workerAlerts.length + personalDocs.length;

  const login = useCallback(async (userId: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error("Autentificare eșuată");
    const payload = (await response.json()) as { user: User };
    setCurrentUser(findDemoUser(payload.user.id));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
  }, []);

  const addDocument = useCallback(
    (doc: Omit<DocumentRecord, "id">) => {
      if (!currentUser || !canViewWorkerData(currentUser, doc.workerId, state.workers)) {
        return;
      }
      setState((prev) => ({
        ...prev,
        documents: [...prev.documents, { ...doc, id: uid() }],
      }));
    },
    [currentUser, state.workers],
  );

  const removeDocument = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setState((prev) => {
        const target = prev.documents.find((item) => item.id === id);
        if (
          !target ||
          !canViewWorkerData(currentUser, target.workerId, prev.workers)
        ) {
          return prev;
        }
        return {
          ...prev,
          documents: prev.documents.filter((item) => item.id !== id),
        };
      });
    },
    [currentUser],
  );

  const addAppointment = useCallback(
    (appointment: Omit<Appointment, "id">) => {
      if (
        !currentUser ||
        !canViewWorkerData(currentUser, appointment.workerId, state.workers)
      ) {
        return;
      }
      setState((prev) => ({
        ...prev,
        appointments: [...prev.appointments, { ...appointment, id: uid() }],
      }));
    },
    [currentUser, state.workers],
  );

  const removeAppointment = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setState((prev) => {
        const target = prev.appointments.find((item) => item.id === id);
        if (
          !target ||
          !canViewWorkerData(currentUser, target.workerId, prev.workers)
        ) {
          return prev;
        }
        return {
          ...prev,
          appointments: prev.appointments.filter((item) => item.id !== id),
        };
      });
    },
    [currentUser],
  );

  const addExtraAvailability = useCallback(
    (item: Omit<ExtraAvailability, "id">) => {
      if (!currentUser || item.workerId !== currentUser.id) return;
      setState((prev) => ({
        ...prev,
        extraAvailability: [...prev.extraAvailability, { ...item, id: uid() }],
      }));
    },
    [currentUser],
  );

  const applyGeneratedRoster = useCallback(
    (input: {
      model: RotationModel;
      workerIds: string[];
      startDate: string;
      days: number;
      staggerTeam: boolean;
      workerModels?: Record<string, RotationModel>;
    }) => {
      if (!currentUser) return 0;
      const workers = state.workers.filter(
        (worker) =>
          input.workerIds.includes(worker.id) &&
          worker.active &&
          canManageWorker(currentUser, worker),
      );
      const generated = generateAdvancedRoster({
        model: input.model,
        workers,
        startDate: input.startDate,
        days: input.days,
        staggerTeam: input.staggerTeam,
        workerModels: input.workerModels,
      });
      const windowDates = new Set(
        Array.from({ length: input.days }, (_, day) => addDaysISO(input.startDate, day)),
      );
      const workerIds = new Set(workers.map((worker) => worker.id));
      const leaveKeys = new Set(
        state.shifts
          .filter((shift) => shift.status !== "shift")
          .map((shift) => `${shift.workerId}:${shift.date}`),
      );
      const roster = generated.filter(
        (shift) => !leaveKeys.has(`${shift.workerId}:${shift.date}`),
      );

      setState((prev) => {
        const kept = prev.shifts.filter((shift) => {
          if (!windowDates.has(shift.date) || !workerIds.has(shift.workerId)) {
            return true;
          }
          return shift.status !== "shift";
        });
        return { ...prev, shifts: [...kept, ...roster] };
      });
      return roster.length;
    },
    [currentUser, state.workers, state.shifts],
  );

  const updateTemplate = useCallback(
    (template: ShiftTemplate) => {
      if (!currentUser) return;
      setState((prev) => ({
        ...prev,
        shiftTemplates: prev.shiftTemplates.map((item) =>
          item.id === template.id ? template : item,
        ),
      }));
    },
    [currentUser],
  );

  const addTemplate = useCallback(
    (template: Omit<ShiftTemplate, "id">) => {
      if (!currentUser) return;
      setState((prev) => ({
        ...prev,
        shiftTemplates: [...prev.shiftTemplates, { ...template, id: uid() }],
      }));
    },
    [currentUser],
  );

  const removeTemplate = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setState((prev) => ({
        ...prev,
        shiftTemplates: prev.shiftTemplates.filter((item) => item.id !== id),
      }));
    },
    [currentUser],
  );

  const addEmployee = useCallback(
    (input: {
      name: string;
      email: string;
      role: string;
      departmentId: string;
      preferredShift: PreferredShift;
    }) => {
      if (!currentUser) return null;
      const department = state.departments.find((item) => item.id === input.departmentId);
      if (!department) return null;
      const draft: Worker = {
        id: uid(),
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role.trim(),
        location: department.name,
        departmentId: department.id,
        preferredShift: input.preferredShift,
        ...flagsFromPreferred(input.preferredShift),
        active: true,
      };
      if (!canManageWorker(currentUser, draft)) return null;
      if (
        !draft.name ||
        !draft.email ||
        state.workers.some((worker) => worker.email.toLowerCase() === draft.email)
      ) {
        return null;
      }
      const user: User = {
        id: draft.id,
        name: draft.name,
        email: draft.email,
        role: "worker",
        departmentId: draft.departmentId,
        jobTitle: draft.role,
      };
      setState((prev) => ({
        ...prev,
        users: [...prev.users, user],
        workers: [...prev.workers, draft],
      }));
      return draft;
    },
    [currentUser, state.departments, state.workers],
  );

  const updateEmployee = useCallback(
    (
      id: string,
      input: {
        name: string;
        email: string;
        role: string;
        departmentId: string;
        preferredShift: PreferredShift;
      },
    ) => {
      if (!currentUser) return;
      setState((prev) => {
        const existing = prev.workers.find((worker) => worker.id === id);
        if (!existing || !canManageWorker(currentUser, existing)) return prev;
        const department = prev.departments.find((item) => item.id === input.departmentId);
        if (!department) return prev;
        const email = input.email.trim().toLowerCase();
        if (
          prev.workers.some(
            (worker) => worker.id !== id && worker.email.toLowerCase() === email,
          )
        ) {
          return prev;
        }
        const next: Worker = {
          ...existing,
          name: input.name.trim(),
          email,
          role: input.role.trim(),
          location: department.name,
          departmentId: department.id,
          preferredShift: input.preferredShift,
          ...flagsFromPreferred(input.preferredShift),
        };
        if (!canManageWorker(currentUser, next)) return prev;
        return {
          ...prev,
          workers: prev.workers.map((worker) => (worker.id === id ? next : worker)),
          users: prev.users.map((user) =>
            user.id === id
              ? {
                  ...user,
                  name: next.name,
                  email: next.email,
                  departmentId: next.departmentId,
                  jobTitle: next.role,
                }
              : user,
          ),
        };
      });
    },
    [currentUser],
  );

  const deactivateEmployee = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setState((prev) => {
        const existing = prev.workers.find((worker) => worker.id === id);
        if (!existing || !canManageWorker(currentUser, existing)) return prev;
        return {
          ...prev,
          workers: prev.workers.map((worker) =>
            worker.id === id ? { ...worker, active: false } : worker,
          ),
        };
      });
    },
    [currentUser],
  );

  const activateEmployee = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setState((prev) => {
        const existing = prev.workers.find((worker) => worker.id === id);
        if (!existing || !canManageWorker(currentUser, existing)) return prev;
        return {
          ...prev,
          workers: prev.workers.map((worker) =>
            worker.id === id ? { ...worker, active: true } : worker,
          ),
        };
      });
    },
    [currentUser],
  );

  const removeEmployee = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setState((prev) => {
        const existing = prev.workers.find((worker) => worker.id === id);
        if (!existing || !canManageWorker(currentUser, existing)) return prev;
        return {
          ...prev,
          workers: prev.workers.filter((worker) => worker.id !== id),
          users: prev.users.filter((user) => user.id !== id),
          shifts: prev.shifts.filter((shift) => shift.workerId !== id),
          documents: prev.documents.filter((doc) => doc.workerId !== id),
          appointments: prev.appointments.filter((item) => item.workerId !== id),
          extraAvailability: prev.extraAvailability.filter((item) => item.workerId !== id),
          distributedDocuments: prev.distributedDocuments.filter(
            (doc) => doc.recipientUserId !== id,
          ),
        };
      });
    },
    [currentUser],
  );

  const assignPersonalFile = useCallback(
    async (recipient: Worker, file: File, title?: string) => {
      if (!currentUser || !canAssignPersonalDocument(currentUser, recipient)) {
        return;
      }
      if (file.size > 1_500_000) {
        throw new Error("Fișierul depășește 1.5 MB în modul demo.");
      }
      const dataUrl = await fileToDataUrl(file);
      const doc: DistributedDocument = {
        id: uid(),
        scope: "personal",
        title: title?.trim() || file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        dataUrl,
        body: `Trimis exclusiv către ${recipient.name}.`,
        recipientUserId: recipient.id,
        departmentId: recipient.departmentId,
        uploadedById: currentUser.id,
        uploadedAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        distributedDocuments: [doc, ...prev.distributedDocuments],
      }));
    },
    [currentUser],
  );

  const postBoard = useCallback(
    async (input: {
      scope: "department" | "company";
      departmentId?: string | null;
      title: string;
      body: string;
      file?: File | null;
    }) => {
      if (!currentUser) return;
      if (input.scope === "company" && !canPostCompanyBoard(currentUser)) return;
      const departmentId =
        input.scope === "department"
          ? input.departmentId ?? currentUser.departmentId
          : null;
      if (
        input.scope === "department" &&
        (!departmentId || !canPostDepartmentBoard(currentUser, departmentId))
      ) {
        return;
      }
      if (input.file && input.file.size > 1_500_000) {
        throw new Error("Fișierul depășește 1.5 MB în modul demo.");
      }
      const dataUrl = input.file ? await fileToDataUrl(input.file) : null;
      const doc: DistributedDocument = {
        id: uid(),
        scope: input.scope,
        title: input.title.trim(),
        fileName: input.file?.name ?? null,
        mimeType: input.file?.type ?? null,
        sizeBytes: input.file?.size ?? null,
        dataUrl,
        body: input.body.trim() || null,
        recipientUserId: null,
        departmentId,
        uploadedById: currentUser.id,
        uploadedAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        distributedDocuments: [doc, ...prev.distributedDocuments],
      }));
    },
    [currentUser],
  );

  const removeDistributed = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setState((prev) => {
        const target = prev.distributedDocuments.find((item) => item.id === id);
        if (!target || !canRemoveDistributed(currentUser, target)) return prev;
        return {
          ...prev,
          distributedDocuments: prev.distributedDocuments.filter(
            (item) => item.id !== id,
          ),
        };
      });
    },
    [currentUser],
  );

  const resetDemo = useCallback(() => {
    setState(seedState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      sessionReady,
      currentUser,
      visibleWorkers: team,
      activeWorkers: activeTeam,
      scopedAlerts,
      workerAlerts,
      personalDocs,
      departmentDocs,
      companyDocs,
      inboxBadgeCount,
      login,
      logout,
      addDocument,
      removeDocument,
      addAppointment,
      removeAppointment,
      addExtraAvailability,
      applyGeneratedRoster,
      updateTemplate,
      addTemplate,
      removeTemplate,
      addEmployee,
      updateEmployee,
      deactivateEmployee,
      activateEmployee,
      removeEmployee,
      assignPersonalFile,
      postBoard,
      removeDistributed,
      resetDemo,
    }),
    [
      state,
      sessionReady,
      currentUser,
      team,
      activeTeam,
      scopedAlerts,
      workerAlerts,
      personalDocs,
      departmentDocs,
      companyDocs,
      inboxBadgeCount,
      login,
      logout,
      addDocument,
      removeDocument,
      addAppointment,
      removeAppointment,
      addExtraAvailability,
      applyGeneratedRoster,
      updateTemplate,
      addTemplate,
      removeTemplate,
      addEmployee,
      updateEmployee,
      deactivateEmployee,
      activateEmployee,
      removeEmployee,
      assignPersonalFile,
      postBoard,
      removeDistributed,
      resetDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useCurrentUser() {
  const { currentUser } = useStore();
  if (!currentUser) throw new Error("Not authenticated");
  return currentUser;
}

export function useCurrentWorker() {
  const { currentUser, state } = useStore();
  const worker = state.workers.find((item) => item.id === currentUser?.id);
  if (!worker) throw new Error("Current worker missing");
  return worker;
}

export function useWorkerShifts() {
  const { currentUser, state } = useStore();
  if (!currentUser) return [];
  return visibleShifts(currentUser, state.shifts, state.workers).filter(
    (shift) => shift.workerId === currentUser.id,
  );
}

export function useScopedHrDocuments() {
  const { currentUser, state } = useStore();
  if (!currentUser) return [];
  return visibleHrDocuments(currentUser, state.documents, state.workers);
}

export function useScopedAppointments() {
  const { currentUser, state } = useStore();
  if (!currentUser) return [];
  return visibleAppointments(currentUser, state.appointments, state.workers);
}

export function useScopedDistributed() {
  const { currentUser, state } = useStore();
  if (!currentUser) return [];
  return visibleDistributedDocuments(currentUser, state.distributedDocuments);
}
