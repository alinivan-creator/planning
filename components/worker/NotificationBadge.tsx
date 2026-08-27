"use client";

import { cn } from "@/lib/cn";

export function NotificationBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;
  const label = count > 9 ? "9+" : String(count);

  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-[10px] font-bold leading-none text-slate-900 ring-2 ring-white",
        className,
      )}
    >
      {label}
    </span>
  );
}
