import { DEMO_USERS, departments, workersFromUsers } from "./auth/users";
import type { AppState, DistributedDocument } from "./types";

const W1 = "w1";
const W2 = "w2";
const W3 = "w3";
const W4 = "w4";

function shift(
  id: string,
  workerId: string,
  date: string,
  start: string,
  end: string,
  location: string,
  status: AppState["shifts"][number]["status"] = "shift",
  label = "Tură",
) {
  return {
    id,
    workerId,
    date,
    start,
    end,
    location,
    label,
    status,
    confirmed: status === "shift",
  };
}

function dist(partial: Omit<DistributedDocument, "dataUrl" | "mimeType" | "sizeBytes"> & Partial<DistributedDocument>): DistributedDocument {
  return {
    dataUrl: null,
    mimeType: partial.fileName ? "application/pdf" : null,
    sizeBytes: partial.fileName ? 124_000 : null,
    ...partial,
  };
}

export const seedState: AppState = {
  departments,
  users: DEMO_USERS,
  workers: workersFromUsers(),
  shifts: [
    shift("s1", W1, "2026-08-24", "07:00", "17:00", "Warehouse 1"),
    shift("s2", W1, "2026-08-25", "07:00", "17:00", "Warehouse 1"),
    shift("s3", W1, "2026-08-26", "07:00", "17:00", "Hala B Producție"),
    shift("s4", W1, "2026-08-27", "07:00", "17:00", "Warehouse 1"),
    shift("s5", W1, "2026-08-28", "07:00", "17:00", "Warehouse 1"),
    shift("s6", W1, "2026-08-30", "07:00", "16:00", "Warehouse 1"),
    shift("s7", W1, "2026-08-31", "07:00", "17:00", "Warehouse 1"),
    shift("s8", W1, "2026-09-01", "07:00", "17:00", "Hala B Producție"),
    shift("s9", W1, "2026-09-02", "06:00", "18:00", "—", "vacation", "Concediu odihnă"),
    shift("s10", W1, "2026-09-03", "06:00", "18:00", "—", "vacation", "Concediu odihnă"),
    shift("s11", W1, "2026-09-04", "06:00", "18:00", "—", "vacation", "Concediu odihnă"),
    shift("s12", W1, "2026-09-07", "06:00", "18:00", "—", "medical", "Concediu medical"),
    shift("s13", W1, "2026-09-08", "07:00", "17:00", "Warehouse 1"),
    shift("s14", W1, "2026-09-09", "07:00", "17:00", "Hala B Producție"),
    shift("s15", W1, "2026-09-10", "06:00", "18:00", "—", "unexcused", "Nemotivat"),
    shift("s16", W1, "2026-09-11", "07:00", "17:00", "Warehouse 1"),
    shift("s17", W2, "2026-08-27", "06:00", "14:00", "Hala B Producție"),
    shift("s18", W3, "2026-08-27", "14:00", "22:00", "Warehouse 1"),
    shift("s19", W3, "2026-08-28", "14:00", "22:00", "Warehouse 1"),
    shift("s20", W4, "2026-08-27", "06:00", "14:00", "Hala B Producție"),
    shift("s21", W4, "2026-08-28", "06:00", "14:00", "Hala B Producție"),
  ],
  documents: [
    { id: "d1", workerId: W1, name: "Autorizație stivuitor", expiryDate: "2026-09-15", alertDays: 30 },
    { id: "d2", workerId: W1, name: "Aviz medical SSM", expiryDate: "2026-09-08", alertDays: 30 },
    { id: "d3", workerId: W1, name: "Permis lucru la înălțime", expiryDate: "2026-10-20", alertDays: 30 },
    { id: "d4", workerId: W1, name: "Certificat ISCIR", expiryDate: "2026-08-20", alertDays: 30 },
    { id: "d5", workerId: W2, name: "Autorizație sudură", expiryDate: "2026-09-05", alertDays: 30 },
    { id: "d6", workerId: W3, name: "Permis stivuitor", expiryDate: "2026-09-18", alertDays: 30 },
  ],
  appointments: [
    { id: "a1", workerId: W1, type: "medical", title: "Control medical periodic", date: "2026-08-25" },
    { id: "a2", workerId: W1, type: "ssm", title: "Instruire SSM anuală", date: "2026-09-03" },
    { id: "a3", workerId: W1, type: "medical", title: "Consultație medicina muncii", date: "2026-09-12" },
    { id: "a4", workerId: W3, type: "ssm", title: "Reciclare SSM", date: "2026-09-04" },
  ],
  extraAvailability: [],
  shiftTemplates: [
    { id: "t-dim", name: "Dimineață", start: "06:00", end: "14:00", location: "Warehouse 1" },
    { id: "t-dup", name: "După-amiază", start: "14:00", end: "22:00", location: "Warehouse 1" },
    { id: "t-noapte", name: "Noapte", start: "22:00", end: "06:00", location: "Hala B Producție" },
  ],
  distributedDocuments: [
    dist({
      id: "dd1",
      scope: "personal",
      title: "Fișa post actualizată",
      fileName: "fisa-post-ion.pdf",
      body: "Document personal — vizibil doar pentru Ion Popescu.",
      recipientUserId: W1,
      departmentId: "dep-wh1",
      uploadedById: "sv-wh1",
      uploadedAt: "2026-08-26T08:00:00",
    }),
    dist({
      id: "dd2",
      scope: "department",
      title: "Reguli acces Warehouse 1",
      fileName: "reguli-wh1.pdf",
      body: "Doar echipa Warehouse 1 vede acest aviz.",
      recipientUserId: null,
      departmentId: "dep-wh1",
      uploadedById: "sv-wh1",
      uploadedAt: "2026-08-25T10:00:00",
    }),
    dist({
      id: "dd3",
      scope: "department",
      title: "Plan mentenanță Hala B",
      fileName: "mentenanta-hala-b.pdf",
      body: "Vizibil exclusiv în Hala B Producție.",
      recipientUserId: null,
      departmentId: "dep-hb",
      uploadedById: "sv-hb",
      uploadedAt: "2026-08-25T11:00:00",
    }),
    dist({
      id: "dd4",
      scope: "company",
      title: "Meniu cantină — săptămâna 35",
      fileName: "meniu-cantina-s35.pdf",
      body: "Comunicare generală pentru toată firma.",
      recipientUserId: null,
      departmentId: null,
      uploadedById: "adm-1",
      uploadedAt: "2026-08-24T09:00:00",
    }),
    dist({
      id: "dd5",
      scope: "company",
      title: "Contract colectiv de muncă",
      fileName: "ccm-2026.pdf",
      body: "Document global, accesibil tuturor angajaților.",
      recipientUserId: null,
      departmentId: null,
      uploadedById: "adm-1",
      uploadedAt: "2026-08-20T09:00:00",
    }),
  ],
};
