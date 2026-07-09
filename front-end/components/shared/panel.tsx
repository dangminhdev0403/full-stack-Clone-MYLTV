import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  action?: string;
  children: ReactNode;
  id?: string;
};

export function Panel({ title, action, children, id }: PanelProps) {
  return (
    <section id={id} className="rounded-xl border border-slate-200 bg-white">
      <div className="flex min-h-12 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold tracking-tight text-slate-950">{title}</h2>
        {action ? (
          <button className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-900 hover:text-blue-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900/15 active:translate-y-px">
            {action}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
