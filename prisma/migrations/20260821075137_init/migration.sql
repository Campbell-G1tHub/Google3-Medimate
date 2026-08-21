/*
  Warnings:

  - You are about to drop the `Test_Table` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Test_Table";

-- CreateTable
CREATE TABLE "TestTable" (
    "id" UUID NOT NULL,
    "name" TEXT,

    CONSTRAINT "TestTable_pkey" PRIMARY KEY ("id")
);
