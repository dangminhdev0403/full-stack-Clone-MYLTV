-- CreateEnum
CREATE TYPE "StudentAccountRelationship" AS ENUM ('guardian', 'student', 'teacher');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "grade" TEXT,
    "class_name" TEXT NOT NULL,
    "school_name" TEXT NOT NULL DEFAULT 'Truong THPT & THCS Luong The Vinh',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_account_links" (
    "student_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "relationship" "StudentAccountRelationship" NOT NULL DEFAULT 'guardian',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_account_links_pkey" PRIMARY KEY ("student_id","account_id","relationship")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_code_key" ON "students"("code");

-- CreateIndex
CREATE INDEX "students_class_name_idx" ON "students"("class_name");

-- CreateIndex
CREATE INDEX "students_grade_idx" ON "students"("grade");

-- CreateIndex
CREATE INDEX "students_is_active_idx" ON "students"("is_active");

-- CreateIndex
CREATE INDEX "student_account_links_account_id_idx" ON "student_account_links"("account_id");

-- CreateIndex
CREATE INDEX "student_account_links_student_id_idx" ON "student_account_links"("student_id");

-- AddForeignKey
ALTER TABLE "student_account_links" ADD CONSTRAINT "student_account_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_account_links" ADD CONSTRAINT "student_account_links_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
