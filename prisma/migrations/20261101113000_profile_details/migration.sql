-- AlterTable
ALTER TABLE "event_attendees" ADD COLUMN "orders_packed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "VolunteerInformation" ADD COLUMN "forklift_license" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "first_aid" BOOLEAN NOT NULL DEFAULT false;
