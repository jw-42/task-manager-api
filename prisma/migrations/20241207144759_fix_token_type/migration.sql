/*
  Warnings:

  - The values [ACCESS,REFRESH] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('access', 'refresh');
ALTER TABLE "Token" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Token" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
ALTER TABLE "Token" ALTER COLUMN "type" SET DEFAULT 'access';
COMMIT;

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "type" SET DEFAULT 'access';
