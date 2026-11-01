-- CreateTable
CREATE TABLE "volunteer_notification_settings" (
    "volunteer_id" UUID NOT NULL,
    "app_notifications" BOOLEAN NOT NULL DEFAULT true,
    "opportunity_notifications" BOOLEAN NOT NULL DEFAULT true,
    "newsletter_notifications" BOOLEAN NOT NULL DEFAULT true,
    "preferences" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "volunteer_notification_settings_pkey" PRIMARY KEY ("volunteer_id")
);

-- AddForeignKey
ALTER TABLE "volunteer_notification_settings" ADD CONSTRAINT "volunteer_notification_settings_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
