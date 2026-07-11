// ====================================================================
// Taswerak — Safe Production Account Creator
// ====================================================================
// This script creates or updates exactly 2 production accounts:
//   1. ADMIN account
//   2. INSTRUCTOR account (Ahmed Zaghloul)
//
// SAFETY RULES:
// - Reads ALL credentials from environment variables (never hardcoded)
// - Uses upsert (idempotent — safe to run multiple times)
// - If user exists: updates role + name + password only
// - If user doesn't exist: creates with correct role
// - NEVER deletes users
// - NEVER creates courses, enrollments, certificates, or demo data
// - NEVER prints passwords to logs
// - NEVER commits secrets
//
// USAGE (in Coolify terminal):
//   ADMIN_EMAIL="real@email.com" \
//   ADMIN_NAME="Real Name" \
//   ADMIN_PASSWORD="strong-password-here" \
//   INSTRUCTOR_EMAIL="ahmed@taswerak.com" \
//   INSTRUCTOR_NAME="Ahmed Zaghloul" \
//   INSTRUCTOR_PASSWORD="strong-password-here" \
//   npx tsx scripts/create-production-users.ts
//
// AFTER USE: Delete this script immediately:
//   rm scripts/create-production-users.ts
// ====================================================================

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Read environment variables ──────────────────────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const INSTRUCTOR_EMAIL = process.env.INSTRUCTOR_EMAIL;
const INSTRUCTOR_NAME = process.env.INSTRUCTOR_NAME;
const INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD;

// ── Validate all required env vars are present ─────────────────
function validateEnv() {
  const missing: string[] = [];

  if (!ADMIN_EMAIL) missing.push("ADMIN_EMAIL");
  if (!ADMIN_NAME) missing.push("ADMIN_NAME");
  if (!ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!INSTRUCTOR_EMAIL) missing.push("INSTRUCTOR_EMAIL");
  if (!INSTRUCTOR_NAME) missing.push("INSTRUCTOR_NAME");
  if (!INSTRUCTOR_PASSWORD) missing.push("INSTRUCTOR_PASSWORD");

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error("");
    console.error("Usage:");
    console.error('  ADMIN_EMAIL="..." ADMIN_NAME="..." ADMIN_PASSWORD="..." \\');
    console.error('  INSTRUCTOR_EMAIL="..." INSTRUCTOR_NAME="..." INSTRUCTOR_PASSWORD="..." \\');
    console.error("  npx tsx scripts/create-production-users.ts");
    process.exit(1);
  }

  // Validate password strength (minimum 12 characters)
  if (ADMIN_PASSWORD!.length < 12) {
    console.error("❌ ADMIN_PASSWORD must be at least 12 characters long");
    process.exit(1);
  }
  if (INSTRUCTOR_PASSWORD!.length < 12) {
    console.error("❌ INSTRUCTOR_PASSWORD must be at least 12 characters long");
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(ADMIN_EMAIL!)) {
    console.error("❌ ADMIN_EMAIL is not a valid email address");
    process.exit(1);
  }
  if (!emailRegex.test(INSTRUCTOR_EMAIL!)) {
    console.error("❌ INSTRUCTOR_EMAIL is not a valid email address");
    process.exit(1);
  }

  // Prevent identical emails
  if (ADMIN_EMAIL === INSTRUCTOR_EMAIL) {
    console.error("❌ ADMIN_EMAIL and INSTRUCTOR_EMAIL must be different");
    process.exit(1);
  }
}

// ── Create or update a single user ─────────────────────────────
async function upsertUser(
  email: string,
  name: string,
  password: string,
  role: Role
): Promise<{ created: boolean; email: string; role: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, role: true },
  });

  if (existing) {
    // UPDATE: only role, name, and password (never delete)
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        password: passwordHash,
        role,
        isBanned: false, // ensure not banned
      },
    });
    return { created: false, email: normalizedEmail, role };
  } else {
    // CREATE: new user with correct role
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: passwordHash,
        role,
      },
    });
    return { created: true, email: normalizedEmail, role };
  }
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log("");
  console.log("🔒 Taswerak — Production Account Creator");
  console.log("=========================================");
  console.log("");

  validateEnv();

  console.log("✅ All environment variables present");
  console.log("✅ Password strength validated (12+ characters)");
  console.log("✅ Email format validated");
  console.log("");

  // Create/Update ADMIN
  console.log("📋 Creating/Updating ADMIN account...");
  const adminResult = await upsertUser(
    ADMIN_EMAIL!,
    ADMIN_NAME!,
    ADMIN_PASSWORD!,
    Role.ADMIN
  );
  console.log(
    `   ${adminResult.created ? "✅ Created" : "✅ Updated"}: ${adminResult.email} (role: ${adminResult.role})`
  );

  // Create/Update INSTRUCTOR
  console.log("📋 Creating/Updating INSTRUCTOR account...");
  const instructorResult = await upsertUser(
    INSTRUCTOR_EMAIL!,
    INSTRUCTOR_NAME!,
    INSTRUCTOR_PASSWORD!,
    Role.INSTRUCTOR
  );
  console.log(
    `   ${instructorResult.created ? "✅ Created" : "✅ Updated"}: ${instructorResult.email} (role: ${instructorResult.role})`
  );

  console.log("");
  console.log("✅ Production accounts ready.");
  console.log("");
  console.log("⚠️  IMPORTANT: Delete this script now:");
  console.log("   rm scripts/create-production-users.ts");
  console.log("");
  console.log("⚠️  IMPORTANT: Change passwords regularly.");
  console.log("⚠️  IMPORTANT: Never share these credentials.");
  console.log("");
}

main()
  .catch((err) => {
    console.error("");
    console.error("❌ Script failed:", err.message);
    console.error("");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
