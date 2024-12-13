-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'VISA_PAGES';
ALTER TYPE "DocumentType" ADD VALUE 'EMPLOYMENT_PROOF';
ALTER TYPE "DocumentType" ADD VALUE 'NATURALIZATION_DECREE';
ALTER TYPE "DocumentType" ADD VALUE 'IDENTITY_PHOTO';
