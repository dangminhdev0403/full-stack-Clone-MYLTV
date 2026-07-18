CREATE TYPE "StudentGender" AS ENUM ('male', 'female', 'other');
CREATE TYPE "StudentGuardianRelationship" AS ENUM ('father', 'mother', 'grandfather', 'grandmother', 'guardian', 'other');
ALTER TABLE "students" ADD COLUMN "date_of_birth" DATE, ADD COLUMN "gender" "StudentGender", ADD COLUMN "ethnicity" TEXT, ADD COLUMN "birth_place" TEXT, ADD COLUMN "permanent_address" TEXT, ADD COLUMN "cohort_start_year" INTEGER, ADD COLUMN "cohort_end_year" INTEGER;
CREATE TABLE "student_guardian_contacts" (
  "id" TEXT NOT NULL, "student_id" TEXT NOT NULL, "relationship" "StudentGuardianRelationship" NOT NULL,
  "relationship_label" TEXT, "full_name" TEXT NOT NULL, "phone" TEXT NOT NULL,
  "is_emergency_contact" BOOLEAN NOT NULL DEFAULT false, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "student_guardian_contacts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "student_guardian_contacts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "student_guardian_contacts_student_id_idx" ON "student_guardian_contacts"("student_id");
CREATE INDEX "student_guardian_contacts_student_id_is_emergency_contact_idx" ON "student_guardian_contacts"("student_id", "is_emergency_contact");