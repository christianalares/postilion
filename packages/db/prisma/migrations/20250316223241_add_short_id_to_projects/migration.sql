/*
  Warnings:

  - A unique constraint covering the columns `[short_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `short_id` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "short_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "projects_short_id_key" ON "projects"("short_id");
