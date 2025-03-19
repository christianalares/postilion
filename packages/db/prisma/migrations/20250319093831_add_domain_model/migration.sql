-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "domain" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "project_id" TEXT,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domains_domain_key" ON "domains"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "domains_project_id_key" ON "domains"("project_id");

-- CreateIndex
CREATE INDEX "domains_team_id_domain_idx" ON "domains"("team_id", "domain");

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
