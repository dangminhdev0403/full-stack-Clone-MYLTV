CREATE TYPE "TuitionChargeStatus" AS ENUM ('unpaid', 'partial', 'paid', 'waived');

CREATE TABLE "tuition_charges" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount_due" INTEGER NOT NULL,
    "amount_paid" INTEGER NOT NULL DEFAULT 0,
    "status" "TuitionChargeStatus" NOT NULL DEFAULT 'unpaid',
    "due_date" DATE,
    "note" TEXT,
    "is_waived" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tuition_charges_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tuition_charges_amount_due_check" CHECK ("amount_due" >= 0),
    CONSTRAINT "tuition_charges_amount_paid_check" CHECK ("amount_paid" >= 0),
    CONSTRAINT "tuition_charges_paid_not_over_due_check" CHECK ("is_waived" OR "amount_paid" <= "amount_due")
);

CREATE UNIQUE INDEX "tuition_charges_student_id_semester_id_title_key" ON "tuition_charges"("student_id", "semester_id", "title");
CREATE INDEX "tuition_charges_semester_id_status_idx" ON "tuition_charges"("semester_id", "status");
CREATE INDEX "tuition_charges_student_id_status_idx" ON "tuition_charges"("student_id", "status");
CREATE INDEX "tuition_charges_due_date_idx" ON "tuition_charges"("due_date");
CREATE INDEX "tuition_charges_created_by_id_idx" ON "tuition_charges"("created_by_id");

ALTER TABLE "tuition_charges" ADD CONSTRAINT "tuition_charges_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tuition_charges" ADD CONSTRAINT "tuition_charges_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tuition_charges" ADD CONSTRAINT "tuition_charges_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
