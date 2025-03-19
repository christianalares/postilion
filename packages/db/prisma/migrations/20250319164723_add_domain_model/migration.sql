/*
  Warnings:

  - Added the required column `forwardemail_id` to the `domains` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "domains" ADD COLUMN     "forwardemail_id" TEXT NOT NULL;
