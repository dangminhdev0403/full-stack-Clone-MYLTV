CREATE TYPE "AttendancePeriod" AS ENUM ('morning', 'afternoon');
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'excused');

CREATE TABLE "attendance_sessions" (
  "id" TEXT NOT NULL,
  "semester_id" TEXT NOT NULL,
  "attendance_date" DATE NOT NULL,
  "period" "AttendancePeriod" NOT NULL,
  "class_name" TEXT NOT NULL,
  "created_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "attendance_sessions_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "attendance_sessions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "attendance_records" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "note" TEXT,
  "marked_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "attendance_records_marked_by_id_fkey" FOREIGN KEY ("marked_by_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "attendance_sessions_semester_id_attendance_date_period_class_name_key" ON "attendance_sessions"("semester_id", "attendance_date", "period", "class_name");
CREATE INDEX "attendance_sessions_attendance_date_class_name_idx" ON "attendance_sessions"("attendance_date", "class_name");
CREATE INDEX "attendance_sessions_created_by_id_idx" ON "attendance_sessions"("created_by_id");
CREATE UNIQUE INDEX "attendance_records_session_id_student_id_key" ON "attendance_records"("session_id", "student_id");
CREATE INDEX "attendance_records_student_id_created_at_idx" ON "attendance_records"("student_id", "created_at");
CREATE INDEX "attendance_records_marked_by_id_idx" ON "attendance_records"("marked_by_id");
