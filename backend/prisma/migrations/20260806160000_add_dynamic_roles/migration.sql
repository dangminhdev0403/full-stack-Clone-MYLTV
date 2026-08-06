-- CreateTable
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_key" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_key")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_role_assignments" (
    "account_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by_id" TEXT,

    CONSTRAINT "account_role_assignments_pkey" PRIMARY KEY ("account_id","role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_role_assignments_account_id_idx" ON "account_role_assignments"("account_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_role_assignments_role_id_idx" ON "account_role_assignments"("role_id");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_role_id_fkey') THEN
        ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_permission_key_fkey') THEN
        ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_fkey" FOREIGN KEY ("permission_key") REFERENCES "permissions"("key") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_role_assignments_account_id_fkey') THEN
        ALTER TABLE "account_role_assignments" ADD CONSTRAINT "account_role_assignments_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_role_assignments_role_id_fkey') THEN
        ALTER TABLE "account_role_assignments" ADD CONSTRAINT "account_role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Backfill built-in system roles
INSERT INTO "roles" ("id", "code", "name", "description", "is_system", "is_active", "version", "created_at", "updated_at")
VALUES
  ('role-super-admin', 'super_admin', 'Super Admin', 'Built-in Super Administrator role', true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role-admin', 'admin', 'Administrator', 'Built-in Administrator role', true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role-teacher', 'teacher', 'Teacher', 'Built-in Teacher role', true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role-student', 'student', 'Student', 'Built-in Student role', true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role-parent', 'parent', 'Parent', 'Built-in Parent role', true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- Backfill default permissions for super_admin role
INSERT INTO "role_permissions" ("role_id", "permission_key", "assigned_at")
SELECT 'role-super-admin', p."key", CURRENT_TIMESTAMP
FROM "permissions" p
ON CONFLICT ("role_id", "permission_key") DO NOTHING;

-- Backfill account role assignments based on existing Account.role enum
INSERT INTO "account_role_assignments" ("account_id", "role_id", "assigned_at")
SELECT a."id", r."id", CURRENT_TIMESTAMP
FROM "accounts" a
JOIN "roles" r ON r."code" = a."role"::text
ON CONFLICT ("account_id", "role_id") DO NOTHING;
