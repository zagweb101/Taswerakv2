// ====================================================================
// Test script for pricing type and course approval workflow logic
// Run with: npx tsx scripts/test-pricing-workflow.ts
// ====================================================================

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, CourseStatus, Role } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/taswerak?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runWorkflowTests() {
  console.log("🧪 Starting pricing and approval workflow tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.log(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Get ahmed (instructor) and admin ids
    const instructor = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const student = await prisma.user.findFirst({ where: { role: "STUDENT" } });

    if (!instructor || !admin || !student) {
      throw new Error("Seeded users missing");
    }

    // -------------------------------------------------------------
    // Test 1: Create a Free Course
    // -------------------------------------------------------------
    console.log("📦 [Test 1] Verifying Free Course creation...");
    const slug = "test-free-course-" + Date.now();
    const freeCourse = await prisma.course.create({
      data: {
        title: "Test Free Course",
        titleAr: "دورة تجريبية مجانية",
        description: "Foundational photography test description.",
        descriptionAr: "وصف دورة تجريبية مجانية.",
        slug,
        isFree: true,
        price: null,
        discountPrice: null,
        status: CourseStatus.DRAFT,
        instructorId: instructor.id,
      },
    });

    assert(freeCourse.isFree === true, "isFree should be true");
    assert(freeCourse.price === null, "price should be null for free courses");
    assert(freeCourse.status === CourseStatus.DRAFT, "Initial status should be DRAFT");

    // -------------------------------------------------------------
    // Test 2: Status conversion when instructor publishes
    // -------------------------------------------------------------
    console.log("\n📦 [Test 2] Verifying status conversion to PENDING_REVIEW...");
    // Simulate PATCH request logic: instructor sends status: "PUBLISHED"
    const isFree = freeCourse.isFree;
    const price = freeCourse.price ? Number(freeCourse.price) : null;
    
    // Simulate API update logic:
    const updatePayload: any = { status: "PUBLISHED" };
    
    // Intercept logic for INSTRUCTOR
    const userRole = Role.INSTRUCTOR;
    if (updatePayload.status === "PUBLISHED" && userRole === Role.INSTRUCTOR) {
      updatePayload.status = "PENDING_REVIEW";
      updatePayload.submittedAt = new Date();
      updatePayload.rejectionReason = null;
    }

    const submittedCourse = await prisma.course.update({
      where: { id: freeCourse.id },
      data: updatePayload,
    });

    assert(submittedCourse.status === CourseStatus.PENDING_REVIEW, "Status should be PENDING_REVIEW");
    assert(submittedCourse.submittedAt !== null, "submittedAt timestamp should be set");
    assert(submittedCourse.rejectionReason === null, "rejectionReason should be null");

    // -------------------------------------------------------------
    // Test 3: Admin Review Approve
    // -------------------------------------------------------------
    console.log("\n📦 [Test 3] Verifying Admin Course Approval...");
    const approvedCourse = await prisma.course.update({
      where: { id: freeCourse.id },
      data: {
        status: "PUBLISHED",
        reviewedAt: new Date(),
        reviewedById: admin.id,
        rejectionReason: null,
      },
    });

    assert(approvedCourse.status === CourseStatus.PUBLISHED, "Approved course status should be PUBLISHED");
    assert(approvedCourse.reviewedById === admin.id, "reviewedById should be admin user id");
    assert(approvedCourse.reviewedAt !== null, "reviewedAt timestamp should be set");

    // -------------------------------------------------------------
    // Test 4: Admin Review Reject
    // -------------------------------------------------------------
    console.log("\n📦 [Test 4] Verifying Admin Course Rejection...");
    const rejectedCourse = await prisma.course.update({
      where: { id: freeCourse.id },
      data: {
        status: "REJECTED",
        rejectionReason: "الرجاء توفير تفاصيل كافية ومقاطع فيديو بجودة أعلى.",
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    });

    assert(rejectedCourse.status === CourseStatus.REJECTED, "Rejected course status should be REJECTED");
    assert(rejectedCourse.rejectionReason === "الرجاء توفير تفاصيل كافية ومقاطع فيديو بجودة أعلى.", "Rejection reason should be recorded");

    // Cleanup
    await prisma.course.delete({ where: { id: freeCourse.id } });
    console.log("");

    console.log("------------------------------------------------");
    console.log(`🏁 Workflow tests complete. Passed: ${passed}, Failed: ${failed}`);
    console.log("------------------------------------------------\n");

  } catch (err) {
    console.error("❌ Workflow tests crashed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runWorkflowTests();
