-- Add Gateway Payments + Points System (incremental)

-- CreateEnum
CREATE TYPE "GatewayPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');
CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'MOYASAR', 'PAYTABS', 'TAP');

-- AlterTable User: add points
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" "GatewayPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
    "providerId" TEXT,
    "receiptUrl" TEXT,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_providerId_key" ON "Payment"("providerId");
CREATE UNIQUE INDEX "Payment_invoiceId_key" ON "Payment"("invoiceId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_courseId_idx" ON "Payment"("courseId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable PointTransaction
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "courseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PointTransaction_userId_idx" ON "PointTransaction"("userId");
CREATE INDEX "PointTransaction_createdAt_idx" ON "PointTransaction"("createdAt");

ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
