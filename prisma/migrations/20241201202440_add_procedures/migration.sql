/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Procedure` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Procedure` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProcedureType" AS ENUM ('PASSPORT_REQUEST', 'VISA_REQUEST', 'BIRTH_REGISTRATION', 'MARRIAGE_REGISTRATION', 'DEATH_REGISTRATION', 'CERTIFICATE_REQUEST', 'CONSULAR_CARD', 'CONSULAR_REGISTRATION', 'DOCUMENT_LEGALIZATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ProcedureStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'ADDITIONAL_INFO_NEEDED', 'APPROVED', 'REJECTED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Procedure_userId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_consulateId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_userId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "procedureRequestId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "procedureRequestId" TEXT;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "procedureRequestId" TEXT;

-- AlterTable
ALTER TABLE "Procedure" DROP COLUMN "completedAt",
DROP COLUMN "metadata",
DROP COLUMN "status",
DROP COLUMN "submittedAt",
DROP COLUMN "userId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "estimatedTime" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "optionalDocuments" "DocumentType"[],
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "requiredDocuments" "DocumentType"[],
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ProcedureType" NOT NULL;

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Request";

-- CreateTable
CREATE TABLE "ProcedureStep" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "procedureId" TEXT NOT NULL,
    "fields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureRequest" (
    "id" TEXT NOT NULL,
    "status" "ProcedureStatus" NOT NULL DEFAULT 'DRAFT',
    "procedureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consulateId" TEXT NOT NULL,
    "formData" JSONB,
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcedureRequest_userId_idx" ON "ProcedureRequest"("userId");

-- CreateIndex
CREATE INDEX "ProcedureRequest_procedureId_idx" ON "ProcedureRequest"("procedureId");

-- CreateIndex
CREATE INDEX "ProcedureRequest_consulateId_idx" ON "ProcedureRequest"("consulateId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_procedureRequestId_fkey" FOREIGN KEY ("procedureRequestId") REFERENCES "ProcedureRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureStep" ADD CONSTRAINT "ProcedureStep_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRequest" ADD CONSTRAINT "ProcedureRequest_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRequest" ADD CONSTRAINT "ProcedureRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRequest" ADD CONSTRAINT "ProcedureRequest_consulateId_fkey" FOREIGN KEY ("consulateId") REFERENCES "Consulate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_procedureRequestId_fkey" FOREIGN KEY ("procedureRequestId") REFERENCES "ProcedureRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_procedureRequestId_fkey" FOREIGN KEY ("procedureRequestId") REFERENCES "ProcedureRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
