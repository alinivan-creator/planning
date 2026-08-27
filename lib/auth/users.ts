import type { Department, User, Worker } from "../types";

export const DEP_WAREHOUSE = "dep-wh1";
export const DEP_HALA_B = "dep-hb";

export const departments: Department[] = [
  { id: DEP_WAREHOUSE, name: "Warehouse 1" },
  { id: DEP_HALA_B, name: "Hala B Producție" },
];

export const DEMO_USERS: User[] = [
  {
    id: "w1",
    name: "Ion Popescu",
    email: "ion.popescu@turaplan.ro",
    role: "worker",
    departmentId: DEP_WAREHOUSE,
    jobTitle: "Operator logistică",
  },
  {
    id: "w3",
    name: "Andrei Dima",
    email: "andrei.dima@turaplan.ro",
    role: "worker",
    departmentId: DEP_WAREHOUSE,
    jobTitle: "Stivuitorist",
  },
  {
    id: "w2",
    name: "Maria Ionescu",
    email: "maria.ionescu@turaplan.ro",
    role: "worker",
    departmentId: DEP_HALA_B,
    jobTitle: "Tehnician producție",
  },
  {
    id: "w4",
    name: "Cristina Enache",
    email: "cristina.enache@turaplan.ro",
    role: "worker",
    departmentId: DEP_HALA_B,
    jobTitle: "Operator producție",
  },
  {
    id: "sv-wh1",
    name: "Elena Vasilescu",
    email: "elena.vasilescu@turaplan.ro",
    role: "supervisor",
    departmentId: DEP_WAREHOUSE,
    jobTitle: "Supervisor Warehouse 1",
  },
  {
    id: "sv-hb",
    name: "Mihai Georgescu",
    email: "mihai.georgescu@turaplan.ro",
    role: "supervisor",
    departmentId: DEP_HALA_B,
    jobTitle: "Supervisor Hala B",
  },
  {
    id: "adm-1",
    name: "Ana Pop",
    email: "ana.pop@turaplan.ro",
    role: "admin",
    departmentId: null,
    jobTitle: "Administrator HR",
  },
];

export function findDemoUser(id: string | undefined | null): User | null {
  if (!id) return null;
  return DEMO_USERS.find((user) => user.id === id) ?? null;
}

export function workersFromUsers(): Worker[] {
  return DEMO_USERS.filter((user) => user.role === "worker").map((user) => {
    const department = departments.find((item) => item.id === user.departmentId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.jobTitle,
      location: department?.name ?? "—",
      departmentId: user.departmentId as string,
      preferredShift:
        user.id === "w3"
          ? "night_exclusive"
          : user.id === "w4"
            ? "fixed_sc1"
            : "rotating",
      scheduleFlag:
        user.id === "w3" ? "night_exclusive" : user.id === "w4" ? "fixed" : "none",
      fixedShiftCode: user.id === "w4" ? "sc1" : user.id === "w3" ? "sc3" : null,
      active: true,
    };
  });
}
