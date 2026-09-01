/*
  Warnings:

  - You are about to drop the `TestTable` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CV', 'ID', 'IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "volunteerRole" AS ENUM ('ADMIN', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_START', 'IN_PROGRESS', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('ATTENDING', 'NOT_ATTENDING');

-- DropTable
DROP TABLE "TestTable";

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerInformationId" UUID,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "declarant_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID,
    "group_id" UUID,
    "author_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "referral_message" TEXT NOT NULL,
    "volunteerInformationId" UUID,

    CONSTRAINT "referees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(0) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "role" "volunteerRole" NOT NULL DEFAULT 'VOLUNTEER',
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(0),
    "refresh_token_expires_at" TIMESTAMPTZ(0),
    "password" TEXT,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(0) NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "volunteer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_group_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "volunteerInformationId" UUID,

    CONSTRAINT "volunteer_group_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "starts_at" TIMESTAMPTZ(0),
    "ends_at" TIMESTAMPTZ(0),
    "status" VARCHAR(255) NOT NULL DEFAULT 'OPEN',
    "created_time" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerGroupId" UUID,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "status" "AttendeeStatus" NOT NULL DEFAULT 'ATTENDING',
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerInformation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "volunteer_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "motivation" TEXT NOT NULL,
    "skills_and_strengths" TEXT NOT NULL,
    "medical_conditions" TEXT,
    "car_type" TEXT,
    "frequent_suburbs" TEXT,
    "frequency" VARCHAR(255) NOT NULL,
    "availability" VARCHAR(255) NOT NULL,
    "agreement_accepted" BOOLEAN NOT NULL,
    "agreement_accepted_at" TIMESTAMPTZ(0),
    "police_check_consent" BOOLEAN NOT NULL,
    "newsletter_opt_in" BOOLEAN NOT NULL,
    "referral_sources" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emergencyContactId" UUID,

    CONSTRAINT "VolunteerInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_volunteer_id_unique" ON "emergency_contacts"("declarant_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_unique" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_email_unique" ON "volunteers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_group_name_unique" ON "volunteer_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_profiles_user_id_unique" ON "VolunteerInformation"("volunteer_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "document_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_volunteerInformationId_fkey" FOREIGN KEY ("volunteerInformationId") REFERENCES "VolunteerInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contact_volunteer_id_foreign" FOREIGN KEY ("declarant_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "post_volunteer_group_id_foreign" FOREIGN KEY ("group_id") REFERENCES "volunteer_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "post_volunteer_id_foreign" FOREIGN KEY ("author_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "post_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referees" ADD CONSTRAINT "referee_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referees" ADD CONSTRAINT "referees_volunteerInformationId_fkey" FOREIGN KEY ("volunteerInformationId") REFERENCES "VolunteerInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "session_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "account_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteer_group_preferences" ADD CONSTRAINT "volunteer_group_preference_volunteer_group_id_foreign" FOREIGN KEY ("group_id") REFERENCES "volunteer_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteer_group_preferences" ADD CONSTRAINT "volunteer_group_preference_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "volunteer_group_preferences" ADD CONSTRAINT "volunteer_group_preferences_volunteerInformationId_fkey" FOREIGN KEY ("volunteerInformationId") REFERENCES "VolunteerInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "event_creator_id_foreign" FOREIGN KEY ("creator_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_volunteerGroupId_fkey" FOREIGN KEY ("volunteerGroupId") REFERENCES "volunteer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendee_event_id_foreign" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "VolunteerInformation" ADD CONSTRAINT "VolunteerInformation_emergencyContactId_fkey" FOREIGN KEY ("emergencyContactId") REFERENCES "emergency_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerInformation" ADD CONSTRAINT "volunteer_information_volunteer_id_foreign" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
