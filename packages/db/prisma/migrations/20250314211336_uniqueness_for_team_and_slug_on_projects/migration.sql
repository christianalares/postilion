/*
  Warnings:

  - A unique constraint covering the columns `[team_id,slug]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "projects_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "projects_team_id_slug_key" ON "projects"("team_id", "slug");
