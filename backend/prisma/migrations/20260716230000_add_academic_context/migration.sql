CREATE TABLE "academic_years" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "starts_on" DATE NOT NULL,
  "ends_on" DATE NOT NULL,
  "is_current" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "academic_years_date_range_check" CHECK ("starts_on" <= "ends_on")
);

CREATE TABLE "semesters" (
  "id" TEXT NOT NULL,
  "academic_year_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "starts_on" DATE NOT NULL,
  "ends_on" DATE NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "is_current" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "semesters_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "semesters_date_range_check" CHECK ("starts_on" <= "ends_on"),
  CONSTRAINT "semesters_sort_order_check" CHECK ("sort_order" > 0)
);

CREATE UNIQUE INDEX "academic_years_code_key" ON "academic_years"("code");
CREATE UNIQUE INDEX "academic_years_single_current_key" ON "academic_years"(("is_current")) WHERE "is_current" = true;
CREATE UNIQUE INDEX "semesters_academic_year_id_code_key" ON "semesters"("academic_year_id", "code");
CREATE UNIQUE INDEX "semesters_academic_year_id_sort_order_key" ON "semesters"("academic_year_id", "sort_order");
CREATE UNIQUE INDEX "semesters_single_current_key" ON "semesters"(("is_current")) WHERE "is_current" = true;
CREATE INDEX "semesters_academic_year_id_idx" ON "semesters"("academic_year_id");

ALTER TABLE "semesters" ADD CONSTRAINT "semesters_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
