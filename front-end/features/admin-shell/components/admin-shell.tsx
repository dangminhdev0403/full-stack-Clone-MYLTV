"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { adminNavItems } from "../data/admin-nav-items";

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined leading-none ${className}`}>{name}</span>;
}

export function AdminShell({ activeHref, title, subtitle, children }: { activeHref: string; title: string; subtitle?: string; children: React.ReactNode }) {
  const { data: session } = useSession();
  const { logout, isLoggingOut } = useLogout();
  const actor = session?.user;
  return <main className="min-h-screen bg-[#f4f7fb] text-slate-950"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-[#082f49] p-5 text-white lg:block"><Link href="/admin" className="text-2xl font-black tracking-tight">MYLTV Console</Link><p className="mt-1 text-xs text-cyan-200">Modular administration</p><nav className="mt-8 space-y-1">{adminNavItems.map((item) => <Link key={item.href} href={item.href} className={`block rounded-lg px-3 py-2.5 font-semibold ${activeHref === item.href ? "bg-cyan-300 text-slate-950" : "text-slate-200 hover:bg-white/10"}`}>{item.label}</Link>)}</nav></aside><div className="lg:ml-64"><header className="flex min-h-16 items-center justify-between border-b bg-white px-4 sm:px-6"><div><span className="font-bold">{actor?.display_name ?? "Đang xác thực..."}</span><span className="ml-2 text-sm text-slate-500">{actor?.role}</span></div><button onClick={logout} disabled={isLoggingOut} className="rounded-lg border px-4 py-2 text-sm font-bold hover:bg-slate-100 disabled:opacity-60">{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</button></header><section className="space-y-6 p-4 sm:p-6"><div><h1 className="text-3xl font-black tracking-tight">{title}</h1>{subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}</div>{children}</section></div></main>;
}
