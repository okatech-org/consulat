/*
  Warnings:

  - You are about to drop the column `requestedForId` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ServiceCategory" ADD VALUE 'TRANSCRIPT';

-- AlterEnum
ALTER TYPE "ServiceStepType" ADD VALUE 'DELIVERY';

-- DropIndex
DROP INDEX "Profile_requestedForId_key";

-- DropIndex
DROP INDEX "ServiceRequest_requestedForId_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "requestedForId",
ADD COLUMN     "validationRequestId" TEXT;
