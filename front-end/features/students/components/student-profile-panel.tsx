import { Icon } from "@/features/admin-shell";
import type {
  StudentDetail,
  StudentGuardianContact,
} from "../service/students.client";

export function StudentProfilePanel({ student }: { student: StudentDetail }) {
  return (
    <section
      id="student-panel-profile"
      role="tabpanel"
      aria-labelledby="student-tab-profile"
      className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <article className="rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-3 text-lg font-extrabold">
          <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-[var(--primary)]">
            <Icon name="person" />
          </span>
          Lý lịch cá nhân
        </h2>
        <dl className="mt-5 divide-y divide-[var(--outline-variant)]">
          <ProfileRow
            label="Ngày sinh"
            value={
              student.date_of_birth
                ? formatDateOnly(student.date_of_birth)
                : "Chưa cập nhật"
            }
          />
          <ProfileRow label="Giới tính" value={genderLabel(student.gender)} />
          <ProfileRow
            label="Dân tộc"
            value={student.ethnicity ?? "Chưa cập nhật"}
          />
          <ProfileRow
            label="Nơi sinh"
            value={student.birth_place ?? "Chưa cập nhật"}
          />
        </dl>
        <div className="mt-5 rounded-xl bg-[var(--surface-low)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--secondary)]">
            Địa chỉ thường trú
          </p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {student.permanent_address ?? "Chưa cập nhật"}
          </p>
        </div>
        <p className="mt-4 text-xs text-[var(--secondary)]">
          Cập nhật gần nhất: {formatDateTime(student.updated_at)}
        </p>
      </article>
      <GuardianCard contacts={student.guardian_contacts ?? []} />
    </section>
  );
}
function GuardianCard({ contacts }: { contacts: StudentGuardianContact[] }) {
  const emergency = contacts.filter((contact) => contact.is_emergency_contact);
  return (
    <article className="rounded-2xl border border-[var(--outline-variant)] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-3 text-lg font-extrabold">
        <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-[var(--primary)]">
          <Icon name="family_restroom" />
        </span>
        Thông tin phụ huynh
      </h2>
      <div className="mt-5 space-y-3">
        {contacts.length ? (
          contacts.map((contact, index) => (
            <div
              key={contact.id ?? `${contact.relationship}-${index}`}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 rounded-xl bg-[var(--surface-low)] p-3.5"
            >
              <span
                aria-hidden="true"
                className={`grid size-11 place-items-center rounded-full ${index % 2 ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}
              >
                <Icon name="person" />
              </span>
              <div className="min-w-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--secondary)]">
                    Họ tên {relationshipLabel(contact)}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold">
                    {contact.full_name}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                  <span className="text-xs text-[var(--secondary)]">SĐT: </span>
                  <a
                    href={phoneHref(contact.phone)}
                    className="inline-flex min-h-11 items-center text-sm font-bold text-[var(--primary)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-[var(--surface-low)] p-4 text-sm text-[var(--secondary)]">
            Chưa cập nhật người giám hộ.
          </p>
        )}
      </div>
      {emergency.length ? (
        <div className="mt-5 rounded-xl bg-violet-50 p-4 text-violet-950">
          <div className="flex gap-3">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700"
            >
              <Icon name="phone_in_talk" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-violet-700">
                Liên hệ khẩn cấp
              </p>
              {emergency.map((contact) => (
                <p
                  key={contact.id ?? contact.phone}
                  className="mt-1 text-sm font-semibold leading-6"
                >
                  {relationshipLabel(contact)}: {contact.full_name} -{" "}
                  <a
                    className="font-extrabold underline-offset-4 hover:underline"
                    href={phoneHref(contact.phone)}
                  >
                    {contact.phone}
                  </a>
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4 py-3.5 text-sm">
      <dt className="font-medium text-[var(--secondary)]">{label}</dt>
      <dd className="break-words text-right font-bold">{value}</dd>
    </div>
  );
}
function formatDateOnly(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
function genderLabel(value: StudentDetail["gender"]) {
  return value === "male"
    ? "Nam"
    : value === "female"
      ? "Nữ"
      : value === "other"
        ? "Khác"
        : "Chưa cập nhật";
}
function relationshipLabel(contact: StudentGuardianContact) {
  return (
    contact.relationship_label ??
    {
      father: "Bố",
      mother: "Mẹ",
      grandfather: "Ông",
      grandmother: "Bà",
      guardian: "Người giám hộ",
      other: "Người liên hệ",
    }[contact.relationship]
  );
}
function phoneHref(phone: string) {
  const normalized = phone.trim().replace(/(?!^)\+|[^\d+]/g, "");
  return `tel:${normalized}`;
}
