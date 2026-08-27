export type UserRole = "worker" | "supervisor" | "admin";

export type ShiftStatus = "shift" | "medical" | "vacation" | "unexcused";

export type AppointmentType = "medical" | "ssm";

export type AlertIcon = "warning" | "exclamation";

export type DocumentScope = "personal" | "department" | "company";

export type ShiftCode = "sc1" | "sc2" | "sc3" | "day12" | "night12";

export type PreferredShift =
  | "rotating"
  | "fixed_sc1"
  | "fixed_sc2"
  | "fixed_sc3"
  | "night_exclusive";

export type ScheduleFlag = "none" | "fixed" | "night_exclusive";

export type RotationModel =
  | "combined_2_2_2_2"
  | "regime_12_24_12_48"
  | "fixed_sc1"
  | "fixed_sc2"
  | "fixed_sc3";

export type CycleLength = 7 | 14 | 21;

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  jobTitle: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  departmentId: string;
  preferredShift: PreferredShift;
  scheduleFlag: ScheduleFlag;
  fixedShiftCode: ShiftCode | null;
  active: boolean;
}

export interface Shift {
  id: string;
  workerId: string;
  date: string;
  start: string;
  end: string;
  location: string;
  label: string;
  status: ShiftStatus;
  confirmed?: boolean;
  generated?: boolean;
}

export interface ExtraAvailability {
  id: string;
  workerId: string;
  date: string;
  start: string;
  end: string;
}

export interface DocumentRecord {
  id: string;
  workerId: string;
  name: string;
  expiryDate: string;
  alertDays: number;
}

export interface Appointment {
  id: string;
  workerId: string;
  type: AppointmentType;
  title: string;
  date: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  start: string;
  end: string;
  location: string;
}

export interface InboxAlert {
  id: string;
  kind: "document" | "appointment";
  icon: AlertIcon;
  title: string;
  message: string;
  workerId: string;
  relatedDate: string;
  daysUntil: number;
}

export interface DistributedDocument {
  id: string;
  scope: DocumentScope;
  title: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  dataUrl: string | null;
  body: string | null;
  recipientUserId: string | null;
  departmentId: string | null;
  uploadedById: string;
  uploadedAt: string;
}

export interface AppState {
  departments: Department[];
  users: User[];
  workers: Worker[];
  shifts: Shift[];
  documents: DocumentRecord[];
  appointments: Appointment[];
  extraAvailability: ExtraAvailability[];
  shiftTemplates: ShiftTemplate[];
  distributedDocuments: DistributedDocument[];
}
