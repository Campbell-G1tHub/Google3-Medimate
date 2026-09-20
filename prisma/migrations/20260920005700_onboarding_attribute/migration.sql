-- AlterTable
ALTER TABLE "volunteers" ADD COLUMN     "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "notification_permissions" (
    "id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "notification_permissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification_permissions" ADD CONSTRAINT "notification_permission_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
