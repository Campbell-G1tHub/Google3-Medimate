-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "VolunteerInformation" ADD COLUMN     "reviewed_at" TIMESTAMPTZ(0),
ADD COLUMN     "reviewed_by_id" UUID,
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "VolunteerInformation_status_created_at_idx" ON "VolunteerInformation"("status", "created_at");

-- AddForeignKey
ALTER TABLE "VolunteerInformation" ADD CONSTRAINT "volunteer_information_reviewed_by_id_foreign" FOREIGN KEY ("reviewed_by_id") REFERENCES "volunteers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
