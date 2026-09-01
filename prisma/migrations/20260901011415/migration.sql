/*
  Warnings:

  - You are about to drop the column `volunteer_id` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[issuer,account_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issuer` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "account_volunteer_id_foreign";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "session_volunteer_id_foreign";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "volunteer_id",
ADD COLUMN     "issuer" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "volunteer_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "volunteers" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_issuer_account_id_key" ON "accounts"("issuer", "account_id");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "session_volunteer_id_foreign" FOREIGN KEY ("user_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "account_volunteer_id_foreign" FOREIGN KEY ("user_id") REFERENCES "volunteers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
