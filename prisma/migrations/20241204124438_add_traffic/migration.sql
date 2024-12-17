/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `vk_user_id` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_vk_user_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "vk_user_id",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Traffic" (
    "id" SERIAL NOT NULL,
    "vk_user_id" INTEGER,
    "vk_app_id" INTEGER,
    "vk_chat_id" INTEGER,
    "vk_is_app_user" INTEGER,
    "vk_are_notifications_enabled" INTEGER,
    "vk_language" TEXT,
    "vk_ref" TEXT,
    "vk_access_token_settings" TEXT,
    "vk_group_id" INTEGER,
    "vk_viewer_group_role" TEXT,
    "vk_platform" TEXT,
    "vk_is_favorite" INTEGER,
    "vk_ts" INTEGER,
    "vk_is_recommended" INTEGER,
    "vk_profile_id" INTEGER,
    "vk_has_profile_button" INTEGER,
    "vk_testing_group_id" INTEGER,
    "sign" TEXT,
    "odr_enabled" INTEGER,

    CONSTRAINT "Traffic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Traffic" ADD CONSTRAINT "Traffic_vk_user_id_fkey" FOREIGN KEY ("vk_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
