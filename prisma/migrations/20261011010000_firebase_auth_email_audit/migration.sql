-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_created_by_fkey";

-- DropForeignKey
ALTER TABLE "event_tickets" DROP CONSTRAINT "event_tickets_created_by_fkey";

-- The old values referenced users.id; they cannot be mapped to emails.
UPDATE "events" SET "created_by" = NULL;
UPDATE "event_tickets" SET "created_by" = NULL;

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ADD COLUMN "updated_by" TEXT;

-- AlterTable
ALTER TABLE "event_tickets" ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ADD COLUMN "updated_by" TEXT;

-- DropTable
DROP TABLE "users";
