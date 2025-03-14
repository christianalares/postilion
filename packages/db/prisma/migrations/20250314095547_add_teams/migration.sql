-- CreateEnum
CREATE TYPE "TEAM_ROLE_ENUM" AS ENUM ('OWNER', 'MEMBER');

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "name" TEXT NOT NULL,
    "image_url" TEXT,
    "auth_token" TEXT,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_on_teams" (
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "role" "TEAM_ROLE_ENUM" NOT NULL,

    CONSTRAINT "users_on_teams_pkey" PRIMARY KEY ("user_id","team_id")
);

-- CreateTable
CREATE TABLE "team_invites" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "team_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_on_teams_team_id_user_id_idx" ON "users_on_teams"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_on_teams_user_id_team_id_key" ON "users_on_teams"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_invites_code_key" ON "team_invites"("code");

-- CreateIndex
CREATE INDEX "team_invites_team_id_created_by_user_id_idx" ON "team_invites"("team_id", "created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_invites_email_team_id_key" ON "team_invites"("email", "team_id");

-- AddForeignKey
ALTER TABLE "users_on_teams" ADD CONSTRAINT "users_on_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_on_teams" ADD CONSTRAINT "users_on_teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
