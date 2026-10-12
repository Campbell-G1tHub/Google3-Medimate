-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'OPPORTUNITY', 'NEWSLETTER');

-- AlterTable
ALTER TABLE "notification_permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "read_at" TIMESTAMPTZ(0),
ADD COLUMN     "volunteer_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "link" TEXT,
ADD COLUMN     "send_to_all" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE "post_recipient_groups" (
    "post_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,

    CONSTRAINT "post_recipient_groups_pkey" PRIMARY KEY ("post_id","group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_permissions_endpoint_key" ON "notification_permissions"("endpoint");

-- CreateIndex
CREATE INDEX "notifications_volunteer_id_read_at_idx" ON "notifications"("volunteer_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_post_id_volunteer_id_key" ON "notifications"("post_id", "volunteer_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_recipient_groups" ADD CONSTRAINT "post_recipient_group_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_recipient_groups" ADD CONSTRAINT "post_recipient_group_volunteer_group_id_foreign" FOREIGN KEY ("group_id") REFERENCES "volunteer_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
