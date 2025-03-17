/*
  Warnings:

  - You are about to drop the column `phoneId` on the `EmergencyContact` table. All the data in the column will be lost.
  - You are about to drop the column `phoneId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Phone` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "EmergencyContact" DROP CONSTRAINT "EmergencyContact_phoneId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_phoneId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_phoneId_fkey";

-- DropIndex
DROP INDEX "EmergencyContact_phoneId_idx";

-- DropIndex
DROP INDEX "User_phoneId_key";

-- AlterTable
ALTER TABLE "EmergencyContact" DROP COLUMN "phoneId",
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "phoneId",
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phoneId",
ADD COLUMN     "phoneNumber" TEXT;

-- DropTable
DROP TABLE "Phone";

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
