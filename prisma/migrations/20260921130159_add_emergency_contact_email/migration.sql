/*
  Warnings:

  - Added the required column `email` to the `emergency_contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emergency_contacts" ADD COLUMN     "email" TEXT NOT NULL;
