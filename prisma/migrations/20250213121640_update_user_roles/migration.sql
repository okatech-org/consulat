/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `ServiceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `UserDocument` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserDocument` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requestId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `countryCode` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_appointmentId_fkey";

-- DropIndex
DROP INDEX "ServiceRequest_appointmentId_key";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "serviceId" TEXT,
ALTER COLUMN "type" SET DEFAULT 'DOCUMENT_SUBMISSION';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "ServiceRequest" DROP COLUMN "appointmentId",
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "roles" "UserRole"[] DEFAULT ARRAY['USER']::"UserRole"[];

-- AlterTable
ALTER TABLE "UserDocument" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_requestId_key" ON "Appointment"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_serviceId_key" ON "Appointment"("serviceId");

-- CreateIndex
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");

-- CreateIndex
CREATE INDEX "Appointment_requestId_idx" ON "Appointment"("requestId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
