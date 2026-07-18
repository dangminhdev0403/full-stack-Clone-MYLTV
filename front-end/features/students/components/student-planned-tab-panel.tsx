import { Icon } from "@/features/admin-shell";
import type { StudentDetailTab } from "./student-detail-tabs";

const content: Record<
  Exclude<StudentDetailTab, "profile" | "tuition">,
  { title: string; message: string; icon: string }
> = {
  attendance: {
    title: "Chuyên cần",
    message: "Dữ liệu chuyên cần theo từng học sinh đang được phát triển.",
    icon: "event_available",
  },
  grades: {
    title: "Điểm số",
    message: "Dữ liệu điểm số và kết quả học tập đang được phát triển.",
    icon: "school",
  },
  transport: {
    title: "Xe tuyến",
    message: "Thông tin xe tuyến của học sinh đang được phát triển.",
    icon: "directions_bus",
  },
};
export function StudentPlannedTabPanel({ tab }: { tab: keyof typeof content }) {
  const item = content[tab];
  return (
    <section
      id={`student-panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`student-tab-${tab}`}
      data-readiness="planned"
      className="rounded-2xl border border-dashed border-[var(--outline-variant)] bg-white p-7 shadow-sm sm:p-10"
    >
      <div className="mx-auto max-w-xl text-center">
        <span
          aria-hidden="true"
          className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--primary-fixed)] text-2xl text-[var(--primary)]"
        >
          <Icon name={item.icon} />
        </span>
        <h2 className="mt-4 text-xl font-extrabold">{item.title}</h2>
        <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-800">
          Đang phát triển
        </span>
        <p className="mt-4 text-sm leading-6 text-[var(--secondary)]">
          {item.message}
        </p>
      </div>
    </section>
  );
}
