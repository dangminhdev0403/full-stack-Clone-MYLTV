import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className: string;
};

export function Badge({ children, className }: BadgeProps) {
  return <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold ring-1 ${className}`}>{children}</span>;
}
