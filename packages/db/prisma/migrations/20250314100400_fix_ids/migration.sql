/*
  Warnings:

  - You are about to drop the column `auth_token` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "auth_token";
