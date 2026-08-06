ALTER TABLE "homework_assignments"
  ALTER COLUMN "student_id" DROP NOT NULL,
  ADD COLUMN "target_type" TEXT NOT NULL DEFAULT 'students',
  ADD COLUMN "class_id" TEXT,
  ADD COLUMN "student_ids" JSONB,
  ADD COLUMN "archived_at" TIMESTAMP(3);

UPDATE "homework_assignments" SET "student_ids" = jsonb_build_array("student_id") WHERE "student_id" IS NOT NULL;

ALTER TABLE "homework_submissions" ADD COLUMN "student_id" TEXT;
UPDATE "homework_submissions" AS submission SET "student_id" = assignment."student_id"
FROM "homework_assignments" AS assignment WHERE submission."homework_id" = assignment."id";
ALTER TABLE "homework_submissions" ALTER COLUMN "student_id" SET NOT NULL;

CREATE INDEX "homework_assignments_class_id_archived_at_idx" ON "homework_assignments"("class_id", "archived_at");
CREATE UNIQUE INDEX "homework_submissions_homework_id_student_id_key" ON "homework_submissions"("homework_id", "student_id");
CREATE INDEX "homework_submissions_student_id_idx" ON "homework_submissions"("student_id");
