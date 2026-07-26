"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { getVisibleAdminNavGroups, resolveAdminBreadcrumbs } from "../data/admin-nav-items";
import { useAcademicContextQuery } from "../hooks/use-academic-context";
import { getCurrentAcademicContext } from "../service/academic-context.client";

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span aria-hidden="true" className={`material-symbols-outlined leading-none ${className}`}>{name}</span>;
}

export function AdminShell({ activeHref, title, subtitle, children }: { activeHref: string; title: string; subtitle?: string; children: React.ReactNode }) {
  const { data: session } = useSession();
  const { logout, isLoggingOut } = useLogout();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const menuDrawerRef = useRef<HTMLElement>(null);
  const hasOpenedMenuRef = useRef(false);
  const actor = session?.user;
  const initials = (actor?.display_name ?? "AD").split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase();
  const groups = getVisibleAdminNavGroups(actor?.permissions ?? [], actor?.role);
  const breadcrumbs = resolveAdminBreadcrumbs(pathname || activeHref);
  const canReadAcademicContext = actor?.role === "super_admin" || actor?.permissions?.includes("academics.context.read");
  const academicContext = useAcademicContextQuery({
    enabled: Boolean(canReadAcademicContext),
  });

  useEffect(() => {
    if (isMenuOpen) {
      hasOpenedMenuRef.current = true;
      menuCloseRef.current?.focus();

      const containMenuFocus = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsMenuOpen(false);
          return;
        }

        if (event.key !== "Tab") return;

        const focusableElements = menuDrawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      document.addEventListener("keydown", containMenuFocus);
      return () => document.removeEventListener("keydown", containMenuFocus);
    }

    if (hasOpenedMenuRef.current) menuTriggerRef.current?.focus();
  }, [isMenuOpen]);

  return <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r border-[var(--outline-variant)] bg-white p-3 md:flex lg:w-[260px] lg:p-4">
      <Brand compact />
      <Navigation activeHref={activeHref} groups={groups} compact />
      <Actor actor={actor} initials={initials} compact />
    </aside>

    {isMenuOpen ? <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Điều hướng quản trị">
      <button className="absolute inset-0 bg-slate-950/45" aria-label="Đóng menu bằng lớp nền" onClick={() => setIsMenuOpen(false)} />
      <aside ref={menuDrawerRef} className="relative flex h-full w-[min(320px,86vw)] flex-col bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between"><button ref={menuCloseRef} type="button" className="order-2 grid size-11 place-items-center rounded-lg text-[var(--secondary)] hover:bg-[var(--surface-low)]" aria-label="Đóng menu điều hướng" onClick={() => setIsMenuOpen(false)}><Icon name="close" /></button><Brand /></div>
        <Navigation activeHref={activeHref} groups={groups} onNavigate={() => setIsMenuOpen(false)} />
        <Actor actor={actor} initials={initials} />
      </aside>
    </div> : null}

    <div className="min-h-dvh md:ml-20 lg:ml-[260px]">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-[var(--outline-variant)] bg-[color:var(--background)]/95 px-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button ref={menuTriggerRef} type="button" className="grid size-11 shrink-0 place-items-center rounded-lg text-[var(--secondary)] hover:bg-[var(--surface-container)] md:hidden" aria-label="Mở menu điều hướng" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)}><Icon name="menu" /></button>
          <AcademicContextStatus query={academicContext} canRead={Boolean(canReadAcademicContext)} />
        </div>
        <div className="relative">
          <button type="button" aria-label="Mở menu tài khoản" aria-expanded={isAccountOpen} onClick={() => setIsAccountOpen((open) => !open)} className="flex min-h-11 max-w-[180px] items-center gap-2 rounded-lg border border-[var(--outline-variant)] bg-white px-2 text-left sm:max-w-[240px] sm:px-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--primary-fixed)] text-xs font-bold text-[var(--primary)]">{initials}</span><span className="hidden min-w-0 sm:block"><strong className="block truncate text-sm">{actor?.display_name ?? "Đang xác thực..."}</strong><span className="block truncate text-xs text-[var(--secondary)]">{actor?.role ?? "Phiên quản trị"}</span></span><Icon name="expand_more" className="text-[18px]" /></button>
          {isAccountOpen ? <div role="menu" className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--outline-variant)] bg-white p-2 shadow-xl"><div className="border-b border-[var(--outline-variant)] px-3 py-2"><strong className="block truncate text-sm">{actor?.display_name ?? "Đang xác thực..."}</strong><span className="block truncate text-xs text-[var(--secondary)]">{actor?.username ?? actor?.role}</span></div><button role="menuitem" type="button" onClick={logout} disabled={isLoggingOut} aria-label={isLoggingOut ? "Đang đăng xuất" : "Đăng xuất"} className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[var(--secondary)] hover:bg-[var(--surface-container)] disabled:opacity-50"><Icon name="logout" className="text-[20px]" />{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</button></div> : null}
        </div>
      </header>
      <section className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6">
        <div><Breadcrumbs items={breadcrumbs} /><h1 className="mt-3 text-2xl font-bold leading-8 tracking-[-0.02em] sm:text-[32px] sm:leading-10">{title}</h1>{subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--secondary)] sm:text-base">{subtitle}</p> : null}</div>
        {children}
      </section>
    </div>
  </main>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/admin" className="flex min-h-16 items-center gap-3 rounded-lg px-2 text-[var(--primary)]"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--primary)] text-white"><Icon name="school" /></span><span className={`${compact ? "md:hidden lg:block" : "block"} min-w-0`}><strong className="block text-xl font-bold tracking-[-0.02em]">EduManager</strong><span className="block text-xs font-medium text-[var(--secondary)]">Hệ thống Quản lý</span></span></Link>;
}

function Navigation({ activeHref, groups, compact = false, onNavigate }: { activeHref: string; groups: ReturnType<typeof getVisibleAdminNavGroups>; compact?: boolean; onNavigate?: () => void }) {
  return <nav aria-label="Điều hướng quản trị" className="mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pb-4">{groups.map((group) => <section key={group.label} aria-label={group.label}><p className={`${compact ? "md:hidden lg:block" : "block"} px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]`}>{group.label}</p><div className="space-y-1">{group.items.map((item) => { const active = activeHref === item.href || (item.href !== "/admin" && activeHref.startsWith(`${item.href}/`)); return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={compact ? item.label : undefined} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${active ? "bg-[var(--secondary-container)] text-[var(--primary)]" : "text-[var(--secondary)] hover:bg-[var(--surface-container)] hover:text-[var(--foreground)]"}`}><Icon name={item.icon} /><span className={compact ? "md:hidden lg:inline" : "inline"}>{item.label}</span></Link>; })}</div></section>)}</nav>;
}

function Breadcrumbs({ items }: { items: ReturnType<typeof resolveAdminBreadcrumbs> }) {
  return <nav aria-label="Đường dẫn trang" className="flex min-w-0 items-center gap-1 overflow-x-auto text-xs text-[var(--secondary)]">{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-1">{index > 0 ? <Icon name="chevron_right" className="text-[16px]" /> : null}{item.href ? <Link href={item.href} className="hover:text-[var(--primary)]">{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</span>)}</nav>;
}

function AcademicContextStatus({ query, canRead }: { query: ReturnType<typeof useAcademicContextQuery>; canRead: boolean }) {
  if (!canRead) return <div className="min-w-0"><p className="truncate text-sm font-semibold">Niên khóa</p><p className="truncate text-xs text-[var(--secondary)]">Không có quyền xem</p></div>;
  if (query.isPending) return <div role="status" className="min-w-0"><p className="truncate text-sm font-semibold">Đang tải niên khóa...</p><p className="truncate text-xs text-[var(--secondary)]">Đang đồng bộ ngữ cảnh học tập</p></div>;
  if (query.isError || !query.data) return <div className="min-w-0"><p className="truncate text-sm font-semibold">Chưa có niên khóa</p><p className="truncate text-xs text-[var(--secondary)]">Ngữ cảnh học tập chưa khả dụng</p></div>;
  const context = query.data as Awaited<ReturnType<typeof getCurrentAcademicContext>>;
  return <div className="min-w-0"><p className="truncate text-sm font-semibold">{context.academicYear.displayName}</p><p className="truncate text-xs text-[var(--secondary)]">{context.semester.displayName}</p></div>;
}

function Actor({ actor, initials, compact = false }: { actor?: Session["user"]; initials: string; compact?: boolean }) {
  return <div className="flex items-center gap-3 border-t border-[var(--outline-variant)] px-2 pt-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--primary-fixed)] text-sm font-bold text-[var(--primary)]">{initials}</span><span className={`${compact ? "md:hidden lg:block" : "block"} min-w-0`}><strong className="block truncate text-sm">{actor?.display_name ?? "Đang xác thực..."}</strong><span className="block truncate text-xs text-[var(--secondary)]">{actor?.role ?? "Quản trị viên"}</span></span></div>;
}
