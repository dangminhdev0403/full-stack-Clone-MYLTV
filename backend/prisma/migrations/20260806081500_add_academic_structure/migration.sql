-- CreateTable
CREATE TABLE "grade_levels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_classes" (
    "id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "grade_level_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "homeroom_teacher_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_enrollments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "starts_on" DATE,
    "ends_on" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_levels_code_key" ON "grade_levels"("code");

-- CreateIndex
CREATE INDEX "school_classes_academic_year_id_idx" ON "school_classes"("academic_year_id");

-- CreateIndex
CREATE INDEX "school_classes_grade_level_id_idx" ON "school_classes"("grade_level_id");

-- CreateIndex
CREATE INDEX "school_classes_homeroom_teacher_id_idx" ON "school_classes"("homeroom_teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_classes_academic_year_id_code_key" ON "school_classes"("academic_year_id", "code");

-- CreateIndex
CREATE INDEX "class_enrollments_student_id_idx" ON "class_enrollments"("student_id");

-- CreateIndex
CREATE INDEX "class_enrollments_class_id_idx" ON "class_enrollments"("class_id");

-- CreateIndex
CREATE INDEX "class_enrollments_is_active_idx" ON "class_enrollments"("is_active");

-- Partial Unique Index: prevent duplicate active enrollment for a student
CREATE UNIQUE INDEX "class_enrollments_active_student_unique_idx" ON "class_enrollments"("student_id") WHERE ("is_active" = true);

-- AddForeignKey
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_grade_level_id_fkey" FOREIGN KEY ("grade_level_id") REFERENCES "grade_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_classes" ADD CONSTRAINT "school_classes_homeroom_teacher_id_fkey" FOREIGN KEY ("homeroom_teacher_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "school_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Data Backfill
-- 1. Backfill grade levels from student grade field and default grade codes ('6', '7', '8', '9')
INSERT INTO "grade_levels" ("id", "code", "display_name", "sort_order", "created_at", "updated_at")
SELECT
    'grade-level-' || g.grade_code AS "id",
    g.grade_code AS "code",
    'Khối ' || g.grade_code AS "display_name",
    CASE
        WHEN g.grade_code ~ '^[0-9]+$' THEN g.grade_code::INTEGER
        ELSE 0
    END AS "sort_order",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT grade AS grade_code FROM "students" WHERE grade IS NOT NULL AND TRIM(grade) <> ''
    UNION
    SELECT unnest(ARRAY['6', '7', '8', '9']) AS grade_code
) g
ON CONFLICT ("code") DO NOTHING;

-- 2. Backfill school classes for current academic year from distinct student class_name and grade
INSERT INTO "school_classes" ("id", "academic_year_id", "grade_level_id", "code", "display_name", "is_active", "created_at", "updated_at")
SELECT
    'school-class-' || ay.id || '-' || s.class_name AS "id",
    ay.id AS "academic_year_id",
    gl.id AS "grade_level_id",
    s.class_name AS "code",
    'Lớp ' || s.class_name AS "display_name",
    true AS "is_active",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT
        class_name,
        COALESCE(
            NULLIF(TRIM(grade), ''),
            SUBSTRING(class_name FROM '^[0-9]+')
        ) AS derived_grade
    FROM "students"
    WHERE class_name IS NOT NULL AND TRIM(class_name) <> ''
) s
JOIN "academic_years" ay ON ay.is_current = true
JOIN "grade_levels" gl ON gl.code = s.derived_grade
ON CONFLICT ("academic_year_id", "code") DO NOTHING;

-- 3. Backfill class enrollments for existing active students in current academic year
INSERT INTO "class_enrollments" ("id", "student_id", "class_id", "starts_on", "is_active", "created_at", "updated_at")
SELECT
    'enrollment-' || st.id || '-' || sc.id AS "id",
    st.id AS "student_id",
    sc.id AS "class_id",
    ay.starts_on AS "starts_on",
    st.is_active AS "is_active",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "students" st
JOIN "academic_years" ay ON ay.is_current = true
JOIN "school_classes" sc ON sc.academic_year_id = ay.id AND sc.code = st.class_name
ON CONFLICT ("id") DO NOTHING;
