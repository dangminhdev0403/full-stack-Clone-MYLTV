"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { safeCallbackUrl } from "@/lib/auth/callback-url";

export function LoginPage({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); try { const destination = safeCallbackUrl(callbackUrl); const result = await signIn("credentials", { redirect: false, username: form.get("username"), password: form.get("password"), callbackUrl: destination }); if (result?.error) { setError("Đăng nhập thất bại"); return; } router.replace(destination); router.refresh(); } catch { setError("Không thể kết nối dịch vụ đăng nhập."); } finally { setLoading(false); } }
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#bae6fd,transparent_35%),linear-gradient(135deg,#f8fafc,#e0f2fe)] p-5"><section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-sky-900/10"><p className="text-sm font-black uppercase tracking-[0.25em] text-sky-700">MYLTV</p><h1 className="mt-3 text-4xl font-black tracking-tight">Admin Console</h1><p className="mt-2 text-slate-600">Đăng nhập bằng tài khoản backend. Token chỉ được lưu trong cookie HttpOnly.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-bold">Tên đăng nhập<input name="username" autoComplete="username" required className="mt-2 w-full rounded-xl border p-3" /></label><label className="block text-sm font-bold">Mật khẩu<input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border p-3" /></label>{error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}<button disabled={loading} className="w-full rounded-xl bg-[#0369a1] p-3 font-black text-white disabled:opacity-60">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button></form></section></main>;
}
