"use client";

import { StoreProvider } from "@/lib/store";
import type { User } from "@/lib/types";
import type { ReactNode } from "react";

export function Providers({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  return <StoreProvider initialUser={initialUser}>{children}</StoreProvider>;
}
