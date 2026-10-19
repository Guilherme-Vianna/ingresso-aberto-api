-- AlterTable
ALTER TABLE "event_tickets" ALTER COLUMN "event_id" DROP NOT NULL,
ALTER COLUMN "created_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "created_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket_purchases" ALTER COLUMN "event_id" DROP NOT NULL,
ALTER COLUMN "ticket_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "event_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
