"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./admin-shell";

export function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    // TODO(auth): temporary frontend-only bypass for routing review.
    // Accepts any or empty input, stores no token/password, and simply enters /admin.
    window.setTimeout(() => router.push("/admin"), 180);
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f8fafc] px-4 py-10 text-[#191b23]">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#c3c6d7] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-[#004ac6] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#dbe1ff]">EduManager</p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.04em]">Vận hành trường học từ một trung tâm quản trị.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[#dbe1ff]">Theo dõi học sinh, chuyên cần, điểm số và học phí bằng giao diện quản trị tiếng Việt.</p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-white/20 bg-white/10 p-5">
            <div className="flex items-center gap-3"><Icon name="verified_user" /><span className="font-semibold">Đăng nhập tạm thời cho kiểm thử giao diện</span></div>
            <p className="text-sm leading-6 text-[#dbe1ff]">Backend và xác thực thật sẽ được tích hợp ở giai đoạn sau.</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-[#dbe1ff] text-[#004ac6]">
                <Icon name="school" className="text-[34px]" />
              </div>
              <p className="text-3xl font-bold tracking-[-0.03em] text-[#004ac6]">EduManager</p>
              <h2 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-[#191b23]">Đăng nhập hệ thống quản trị</h2>
              <p className="mt-2 text-sm leading-6 text-[#505f76]">Chào mừng quay trở lại, vui lòng nhập thông tin của bạn.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191b23]" htmlFor="email">Tài khoản</label>
                <input id="email" name="email" autoComplete="username" className="h-12 w-full rounded-xl border border-[#c3c6d7] bg-white px-4 text-base text-[#191b23] outline-none transition focus:border-[#004ac6] focus:ring-4 focus:ring-[#b4c5ff]" placeholder="admin@edumanager.vn" />
                <p className="text-xs text-[#505f76]">Có thể để trống trong bản frontend tạm thời.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191b23]" htmlFor="password">Mật khẩu</label>
                <input id="password" name="password" type="password" autoComplete="current-password" className="h-12 w-full rounded-xl border border-[#c3c6d7] bg-white px-4 text-base text-[#191b23] outline-none transition focus:border-[#004ac6] focus:ring-4 focus:ring-[#b4c5ff]" placeholder="Nhập mật khẩu" />
              </div>

              <button disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#004ac6] px-5 text-base font-bold text-white shadow-[0_12px_26px_rgba(0,74,198,0.22)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] active:scale-[0.98] disabled:cursor-wait disabled:opacity-75" type="submit">
                {loading ? <Icon name="progress_activity" className="animate-spin text-[20px]" /> : <Icon name="login" className="text-[20px]" />}
                {loading ? "Đang vào hệ thống" : "Đăng nhập"}
              </button>
            </form>

            <p className="mt-6 rounded-xl border border-[#ffdbcd] bg-[#fff7ed] p-4 text-sm leading-6 text-[#7c2d12]">Tạm thời: biểu mẫu này chỉ điều hướng sang /admin, không lưu mật khẩu, token hoặc gọi API.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
