"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { safeCallbackUrl } from "@/lib/auth/callback-url";

export function LoginPage({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const destination = safeCallbackUrl(callbackUrl);
      const result = await signIn("credentials", {
        redirect: false,
        username: form.get("username"),
        password: form.get("password"),
        callbackUrl: destination,
      });
      if (result?.error) {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        return;
      }
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Không thể kết nối dịch vụ đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-y-auto bg-[#d9d9e5] px-4 py-6 sm:px-6 sm:py-8">
      <Image
        src="/images/auth/edumanager-login-lounge.jpg"
        alt="Không gian học tập hiện đại của EduManager"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#004ac6]/10 mix-blend-multiply" />

      <section className="relative z-10 w-full max-w-[480px] rounded-xl border border-[rgba(195,198,215,0.3)] bg-white/85 p-6 shadow-xl backdrop-blur-lg sm:p-10 md:p-12">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mx-auto flex w-fit items-center gap-3">
            <span aria-hidden="true" className="grid size-12 place-items-center rounded-lg bg-[var(--primary)] text-white">
              <span className="material-symbols-outlined text-[30px]">school</span>
            </span>
            <span className="text-2xl font-bold tracking-[-0.02em] text-[var(--primary)]">EduManager</span>
          </div>
          <h1 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">Đăng nhập hệ thống quản trị</h1>
          <p className="mt-2 text-sm leading-5 text-[#434655]">Chào mừng quay trở lại, vui lòng nhập thông tin của bạn.</p>
        </header>

        <form onSubmit={submit} className="space-y-6" aria-busy={loading}>
          <div className="space-y-2">
            <label htmlFor="username" className="block text-[13px] font-medium leading-[18px] text-[#434655]">Tên đăng nhập</label>
            <div className="group relative">
              <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-[var(--outline)] transition-colors group-focus-within:text-[var(--primary)]">person</span>
              <input id="username" name="username" autoComplete="username" required disabled={loading} className="min-h-12 w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-low)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] transition-colors placeholder:text-[#5d6070] focus:border-[var(--primary)] focus:bg-white focus:outline-none disabled:opacity-70" placeholder="Nhập tên đăng nhập" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-[13px] font-medium leading-[18px] text-[#434655]">Mật khẩu</label>
            <div className="group relative">
              <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-[var(--outline)] transition-colors group-focus-within:text-[var(--primary)]">lock</span>
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={loading} className="min-h-12 w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-low)] py-3 pl-10 pr-12 text-sm text-[var(--foreground)] transition-colors placeholder:text-[#5d6070] focus:border-[var(--primary)] focus:bg-white focus:outline-none disabled:opacity-70" placeholder="••••••••" />
              <button type="button" disabled={loading} className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-[var(--outline)] transition-colors hover:bg-[var(--surface-container)] hover:text-[var(--foreground)] disabled:opacity-50" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}><span aria-hidden="true" className="material-symbols-outlined text-[21px]">{showPassword ? "visibility_off" : "visibility"}</span></button>
            </div>
          </div>

          {error ? <p role="alert" aria-live="polite" className="flex items-start gap-2 rounded-lg bg-[#ffdad6] p-3 text-sm font-medium text-[#93000a]"><span aria-hidden="true" className="material-symbols-outlined text-[19px]">error</span>{error}</p> : null}

          <button type="submit" disabled={loading} aria-busy={loading} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-base font-semibold text-white shadow-md transition-[background-color,transform] duration-200 hover:bg-[var(--primary-container)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-[var(--primary)]">{loading ? <><span className="size-[18px] animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />Đang đăng nhập...</> : "Đăng nhập"}</button>
        </form>

        <footer className="mt-8 border-t border-[rgba(195,198,215,0.3)] pt-6 text-center text-[11px] leading-[14px] text-[#434655] sm:mt-10 sm:pt-8">
          © 2026 EduManager System. All rights reserved.
        </footer>
      </section>
    </main>
  );
}
