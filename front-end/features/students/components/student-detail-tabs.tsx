import { KeyboardEvent, useRef } from "react";

export type StudentDetailTab =
  "profile" | "attendance" | "grades" | "tuition" | "transport";
const tabs: Array<{ id: StudentDetailTab; label: string }> = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "attendance", label: "Chuyên cần" },
  { id: "grades", label: "Điểm số" },
  { id: "tuition", label: "Học phí" },
  { id: "transport", label: "Xe tuyến" },
];
export function StudentDetailTabs({
  active,
  onChange,
}: {
  active: StudentDetailTab;
  onChange: (tab: StudentDetailTab) => void;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  function keyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }
  return (
    <div
      role="tablist"
      aria-label="Các phần hồ sơ học sinh"
      className="flex overflow-x-auto border-b border-[var(--outline-variant)] bg-white px-1"
    >
      {tabs.map((tab, index) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={`student-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`student-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => keyDown(event, index)}
            className={`relative min-h-12 shrink-0 px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary)] sm:px-5 ${selected ? "text-[var(--primary)] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--primary)]" : "text-[var(--secondary)] hover:text-[var(--foreground)]"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
