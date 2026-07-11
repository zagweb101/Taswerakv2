-- AlterEnum: add GUARDIAN to Role
ALTER TYPE "Role" ADD VALUE 'GUARDIAN';

-- CreateTable
CREATE TABLE "GuardianLink" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "relation" TEXT NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardianLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuardianLink_guardianId_studentId_key" ON "GuardianLink"("guardianId", "studentId");
CREATE INDEX "GuardianLink_guardianId_idx" ON "GuardianLink"("guardianId");
CREATE INDEX "GuardianLink_studentId_idx" ON "GuardianLink"("studentId");
