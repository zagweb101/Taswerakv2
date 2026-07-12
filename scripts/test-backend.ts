// ====================================================================
// Backend Integration & Verification Script
// Run with: npx tsx scripts/test-backend.ts
// ====================================================================

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/taswerak?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("🚀 Starting Backend Integration & Verification Tests...\n");
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
    // -------------------------------------------------------------
    // Test 1: Database Connection & Seed Data Integrity
    // -------------------------------------------------------------
    console.log("📂 [Test 1] Verifying Database Connection & Seed Data...");
    const users = await prisma.user.findMany({
      select: { email: true, role: true },
    });
    
    assert(users.length >= 3, "Database should have at least 3 users");
    
    const emails = users.map(u => u.email);
    assert(emails.includes("admin@taswerak.com"), "Admin account admin@taswerak.com exists");
    assert(emails.includes("ahmed@taswerak.com"), "Instructor account ahmed@taswerak.com exists");
    assert(emails.includes("student@taswerak.com"), "Student account student@taswerak.com exists");
    
    const coursesCount = await prisma.course.count();
    assert(coursesCount > 0, `Database has courses seeded: ${coursesCount}`);
    console.log("");

    // -------------------------------------------------------------
    // Test 2: Local File Server Traversal Protection
    // -------------------------------------------------------------
    console.log("🔒 [Test 2] Verifying File Serving API Directory Traversal Protection...");
    const traversalResponse = await fetch("http://localhost:3000/api/files/..%2F..%2Fpackage.json");
    assert(traversalResponse.status === 403 || traversalResponse.status === 404, 
      `Traversal attempt should return 403 or 404, got: ${traversalResponse.status}`
    );

    const normalMissingResponse = await fetch("http://localhost:3000/api/files/missing_file.jpg");
    assert(normalMissingResponse.status === 404, 
      `Non-existent file should return 404, got: ${normalMissingResponse.status}`
    );
    console.log("");

    // -------------------------------------------------------------
    // Test 3: Coupon Validation Endpoint (Read-Only Check)
    // -------------------------------------------------------------
    console.log("🎫 [Test 3] Verifying Coupon Validation (Side-Effect Free)...");
    
    // Create a temporary coupon for testing
    const testCode = "TESTCOUPON_" + Math.random().toString(36).slice(2, 6).toUpperCase();
    await prisma.coupon.create({
      data: {
        code: testCode,
        type: "FIXED",
        value: 100,
        validFrom: new Date(Date.now() - 10000),
        maxUses: 5,
        usedCount: 0,
        isActive: true,
      }
    });

    const validateRes = await fetch("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: testCode,
        courseId: "any-course",
        amount: 500,
      })
    });

    assert(validateRes.ok, `Coupon validate request should succeed, status: ${validateRes.status}`);
    const validateData = await validateRes.json();
    assert(validateData.ok === true, "Validation body should have ok: true");
    assert(validateData.coupon.discount === 100, "Calculated discount should be 100");

    // Fetch from DB again to verify usedCount DID NOT increment
    const updatedCoupon = await prisma.coupon.findUnique({
      where: { code: testCode }
    });
    assert(updatedCoupon?.usedCount === 0, 
      `Validate API must not increment usedCount. Expected: 0, Got: ${updatedCoupon?.usedCount}`
    );

    // Cleanup
    await prisma.coupon.delete({ where: { code: testCode } });
    console.log("");

    // -------------------------------------------------------------
    // Test 4: Webhook endpoints validation (Moyasar / Tap)
    // -------------------------------------------------------------
    console.log("💳 [Test 4] Verifying Payment Webhook Handlers (Moyasar / Tap)...");
    
    // Acknowledge check for Moyasar
    const moyasarRes = await fetch("http://localhost:3000/api/payments/callback/moyasar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "payment_id_test_123",
        status: "paid",
        amount: 49900,
      })
    });
    assert(moyasarRes.ok, `Moyasar webhook should return HTTP 200, got: ${moyasarRes.status}`);
    const moyasarData = await moyasarRes.json();
    assert(moyasarData.ok === true, "Moyasar webhook response should have ok: true");

    // Acknowledge check for Tap
    const tapRes = await fetch("http://localhost:3000/api/payments/callback/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "charge_id_test_123",
        status: "CAPTURED",
        amount: 499,
      })
    });
    assert(tapRes.ok, `Tap webhook should return HTTP 200, got: ${tapRes.status}`);
    const tapData = await tapRes.json();
    assert(tapData.ok === true, "Tap webhook response should have ok: true");
    console.log("");

    // -------------------------------------------------------------
    // Test 5: SMTP service singleton verification
    // -------------------------------------------------------------
    console.log("📧 [Test 5] Verifying SMTP mail transporter lazy setup...");
    const emailService = await import("../src/lib/services/marketing-email");
    assert(typeof emailService.sendWelcomeEmail === "function", "sendWelcomeEmail service is loaded");

    console.log("\n------------------------------------------------");
    console.log(`🏁 All tests completed. Passed: ${passed}, Failed: ${failed}`);
    console.log("------------------------------------------------\n");
    
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Test script crashed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runTests();
