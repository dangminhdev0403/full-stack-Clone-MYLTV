"use client";

import Link from "next/link";
import { AdminShell, Icon } from "@/features/admin-shell";
import { useAttendanceQuery } from "@/features/attendance/hooks/use-attendance";
import { useFeedbackQuery } from "@/features/feedback/hooks/use-feedback";
import { useNewsQuery } from "@/features/news/hooks/use-news";
import { useNotificationsQuery } from "@/features/notifications/hooks/use-notifications";
import { useStudentsQuery } from "@/features/students/hooks/use-students";
import { useTuitionListQuery } from "@/features/tuition/hooks/use-tuition";
import { useUsersQuery } from "@/features/users/hooks/use-users";

const SUMMARY_QUERY = "?page=1&page_size=1";

export function AdminDashboard() {
  const usersQuery = useUsersQuery(SUMMARY_QUERY);
  const studentsQuery = useStudentsQuery(SUMMARY_QUERY);
  const attendanceQuery = useAttendanceQuery(SUMMARY_QUERY);
  const tuitionQuery = useTuitionListQuery(SUMMARY_QUERY);
  const newsQuery = useNewsQuery("?page=1&page_size=3");
  const notificationsQuery = useNotificationsQuery(SUMMARY_QUERY);
  const feedbackQuery = useFeedbackQuery({ page: 1, page_size: 1 });

  return (
    <AdminShell
      activeHref="/admin"
      title="Tổng quan"
      subtitle="Theo dõi các module đang vận hành bằng dữ liệu trực tiếp từ hệ thống."
    >
      <section aria-label="Chỉ số hệ thống" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <SummaryCard
          title="Người dùng"
          icon="manage_accounts"
          href="/admin/users"
          value={usersQuery.data?.total}
          isPending={usersQuery.isPending}
          isError={usersQuery.isError}
          errorMessage="Không thể tải số người dùng."
          retryLabel="Thử lại"
          onRetry={() => void usersQuery.refetch()}
        />
        <SummaryCard
          title="Học sinh"
          icon="groups"
          href="/admin/students"
          value={studentsQuery.data?.total}
          isPending={studentsQuery.isPending}
          isError={studentsQuery.isError}
          errorMessage="Không thể tải số học sinh."
          retryLabel="Thử lại"
          onRetry={() => void studentsQuery.refetch()}
        />
        <SummaryCard
          title="Điểm danh"
          icon="fact_check"
          href="/admin/attendance"
          value={attendanceQuery.data?.total}
          isPending={attendanceQuery.isPending}
          isError={attendanceQuery.isError}
          errorMessage="Không thể tải số buổi điểm danh."
          retryLabel="Thử lại"
          onRetry={() => void attendanceQuery.refetch()}
        />
        <SummaryCard
          title="Khoản thu học phí"
          icon="payments"
          href="/admin/tuition"
          value={tuitionQuery.data?.total}
          isPending={tuitionQuery.isPending}
          isError={tuitionQuery.isError}
          errorMessage="Không thể tải khoản thu."
          retryLabel="Thử lại"
          onRetry={() => void tuitionQuery.refetch()}
        />
        <SummaryCard
          title="Tin tức"
          icon="newspaper"
          href="/admin/news"
          value={newsQuery.data?.total}
          isPending={newsQuery.isPending}
          isError={newsQuery.isError}
          errorMessage="Không thể tải số tin tức."
          retryLabel="Thử lại"
          onRetry={() => void newsQuery.refetch()}
        />
        <SummaryCard
          title="Thông báo"
          icon="notifications"
          href="/admin/notifications"
          value={notificationsQuery.data?.total}
          isPending={notificationsQuery.isPending}
          isError={notificationsQuery.isError}
          errorMessage="Không thể tải số thông báo."
          retryLabel="Thử lại"
          onRetry={() => void notificationsQuery.refetch()}
        />
        <SummaryCard
          title="Phản hồi"
          icon="rate_review"
          href="/admin/feedback"
          value={feedbackQuery.data?.total}
          isPending={feedbackQuery.isPending}
          isError={feedbackQuery.isError}
          errorMessage="Không thể tải số phản hồi."
          retryLabel="Thử lại"
          onRetry={() => void feedbackQuery.refetch()}
        />
      </section>

      <section aria-labelledby="recent-activity-title" className="rounded-xl border border-[var(--outline-variant)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-6">
        <h2 id="recent-activity-title" className="text-xl font-semibold">Hoạt động gần đây</h2>
        <p className="mt-1 text-sm text-[var(--secondary)]">Tin tức cập nhật mới nhất từ dữ liệu quản trị.</p>
        {newsQuery.isPending ? (
          <div role="status" className="mt-5 h-20 animate-pulse rounded-lg bg-[var(--surface-container)]"><span className="sr-only">Đang tải hoạt động gần đây...</span></div>
        ) : newsQuery.isError ? (
          <div className="mt-5"><p role="alert" className="text-sm font-semibold text-[var(--error)]">Không thể tải hoạt động gần đây.</p><button type="button" onClick={() => void newsQuery.refetch()} className="mt-3 min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm font-semibold">Thử lại</button></div>
        ) : newsQuery.data?.items.length ? (
          <ul className="mt-5 divide-y divide-[var(--outline-variant)]">
            {newsQuery.data.items.map((news) => (
              <li key={news.id} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div><Link href={`/admin/news?news_id=${encodeURIComponent(news.id)}`} className="font-semibold text-[var(--primary)] hover:underline">{news.title}</Link><p className="mt-1 text-sm text-[var(--secondary)]">{news.summary}</p></div>
                <time className="text-sm text-[var(--secondary)]" dateTime={news.updated_at}>{new Date(news.updated_at).toLocaleString("vi-VN")}</time>
              </li>
            ))}
          </ul>
        ) : <p className="mt-5 text-sm text-[var(--secondary)]">Chưa có hoạt động gần đây.</p>}
      </section>

      {/* Active Modules Overview */}
      <section
        aria-labelledby="available-modules-title"
        className="rounded-xl border border-[var(--outline-variant)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[var(--primary-fixed)] text-[var(--primary)]">
            <Icon name="apps" />
          </span>
          <div>
            <h2 id="available-modules-title" className="text-xl font-semibold">
              Module đã tích hợp API thật
            </h2>
            <p className="mt-1 text-sm text-[var(--secondary)]">
              Dữ liệu được truy vấn qua BFF Next.js và NestJS Modular Monolith backend.
            </p>
          </div>
        </div>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Identity & Access", "Đăng nhập, JWT, refresh session, phân quyền"],
            ["User Management", "Quản trị người dùng & đặt lại mật khẩu"],
            ["Student Administration", "Hồ sơ học sinh & liên kết tài khoản"],
            ["Academics Attendance", "Điểm danh hàng ngày theo lớp học"],
            ["Billing Tuition", "Khoản thu học phí và miễn giảm"],
            ["Communication News & Notifications", "Tin tức, thông báo nhà trường & phản hồi"],
          ].map(([name, description]) => (
            <li
              key={name}
              className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-low)] p-4"
            >
              <p className="font-semibold">{name}</p>
              <p className="mt-1 text-sm text-[var(--secondary)]">{description}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#166534]">
                <span className="size-2 rounded-full bg-[#15803d]" />
                Đang hoạt động
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}

type SummaryCardProps = Readonly<{
  title: string;
  icon: string;
  href: string;
  value?: number;
  isPending: boolean;
  isError: boolean;
  errorMessage: string;
  retryLabel: string;
  onRetry: () => void;
}>;

function SummaryCard({
  title,
  icon,
  href,
  value,
  isPending,
  isError,
  errorMessage,
  retryLabel,
  onRetry,
}: Readonly<SummaryCardProps>) {
  return (
    <article className="rounded-xl border border-[var(--outline-variant)] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--secondary)]">{title}</p>
          {!isPending && !isError ? (
            <p className="mt-1 text-3xl font-bold leading-10 tracking-[-0.02em]">{value ?? 0}</p>
          ) : null}
        </div>
        <span className="grid size-11 place-items-center rounded-lg bg-[var(--primary-fixed)] text-[var(--primary)]">
          <Icon name={icon} />
        </span>
      </div>
      {isPending ? (
        <div role="status" className="mt-3">
          <span className="sr-only">Đang tải...</span>
          <div className="h-10 w-24 animate-pulse rounded-lg bg-[var(--surface-container)]" />
        </div>
      ) : null}
      {isError ? (
        <div className="mt-3">
          <p role="alert" className="text-sm font-semibold text-[var(--error)]">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            {retryLabel}
          </button>
        </div>
      ) : null}
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        Mở quản lý {title.toLocaleLowerCase("vi")}
        <Icon name="arrow_forward" className="text-[18px]" />
      </Link>
    </article>
  );
}
