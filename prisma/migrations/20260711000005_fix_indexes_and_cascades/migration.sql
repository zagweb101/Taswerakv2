-- Add missing indexes
CREATE INDEX IF NOT EXISTS "PaymentReceipt_enrollmentId_idx" ON "PaymentReceipt"("enrollmentId");
CREATE INDEX IF NOT EXISTS "Submission_critiqueById_idx" ON "Submission"("critiqueById");
CREATE INDEX IF NOT EXISTS "Submission_enrollmentId_idx" ON "Submission"("enrollmentId");
CREATE INDEX IF NOT EXISTS "Certificate_enrollmentId_idx" ON "Certificate"("enrollmentId");

-- Change cascades: Enrollment → SetNull (preserve audit/financial/certificate data)
-- PaymentReceipt.enrollmentId
ALTER TABLE "PaymentReceipt" ALTER COLUMN "enrollmentId" DROP NOT NULL;
ALTER TABLE "PaymentReceipt" DROP CONSTRAINT IF EXISTS "PaymentReceipt_enrollmentId_fkey";
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Submission.enrollmentId
ALTER TABLE "Submission" ALTER COLUMN "enrollmentId" DROP NOT NULL;
ALTER TABLE "Submission" DROP CONSTRAINT IF EXISTS "Submission_enrollmentId_fkey";
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Certificate.enrollmentId
ALTER TABLE "Certificate" ALTER COLUMN "enrollmentId" DROP NOT NULL;
ALTER TABLE "Certificate" DROP CONSTRAINT IF EXISTS "Certificate_enrollmentId_fkey";
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
