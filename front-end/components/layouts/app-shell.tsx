import type { ReactNode } from "react";

type AppShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
};

export function AppShell({ sidebar, topbar, children, aside }: AppShellProps) {
  return (
    <main className="min-h-[100dvh] bg-slate-100 text-slate-950">
      <div className="grid min-h-[100dvh] w-full lg:grid-cols-[280px_minmax(0,1fr)]">
        {sidebar}
        <div className="min-w-0">
          {topbar}
          <div className="grid w-full gap-4 px-4 py-4 sm:px-5 xl:px-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-4">{children}</div>
            {aside ? <aside className="min-w-0">{aside}</aside> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
