// ====================================================================
// Taswerak — Seed script
// Run with: bun prisma/seed.ts
// Creates:
//   1. Admin + Instructor (Ahmed Zaghloul) + demo Student
//   2. Reference courses (أساسيات التصوير، تصوير البيوتي Beauty، ميكب توتوريال)
//   3. Featured testimonials (صفاء، أماني بخش، المها اليازيدي)
// ====================================================================

import { PrismaClient, Role, CourseLevel, CourseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Taswerak...");

  // -------- 1. Users --------
  const adminEmail = "admin@taswerak.com";
  const instructorEmail = "ahmed@taswerak.com";
  const studentEmail = "student@taswerak.com";

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "مدير النظام",
      password: passwordHash,
      role: Role.ADMIN,
      phone: "+966500000000",
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: instructorEmail },
    update: {},
    create: {
      email: instructorEmail,
      name: "أحمد زغلول",
      password: passwordHash,
      role: Role.INSTRUCTOR,
      phone: "+966500000001",
      bio: "مصور محترف ومدرّب تصوير مقيم في جدة. مؤسس منصة تصويرك.",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      name: "طالبة تجريبية",
      password: passwordHash,
      role: Role.STUDENT,
      phone: "+966500000002",
    },
  });

  console.log(`✅ Users: ${admin.email}, ${instructor.email}, ${student.email}`);

  // -------- 2. Reference courses --------
  const courses = [
    {
      slug: "photography-fundamentals",
      title: "Photography Fundamentals",
      titleAr: "أساسيات التصوير",
      description:
        "Course covers the foundational principles of photography: camera anatomy, exposure triangle, composition rules, lighting basics, and the journey from auto to manual mode.",
      descriptionAr:
        "دورة شاملة تغطي المبادئ الأساسية للتصوير الفوتوغرافي: تشريح الكاميرا، مثلث التعريض، قواعد التكوين، أساسيات الإضاءة، والرحلة من الوضع التلقائي إلى اليدوي.",
      price: 499,
      level: CourseLevel.BEGINNER,
      category: "أساسيات",
    },
    {
      slug: "beauty-photography-12-lectures",
      title: "Beauty Photography (12 Lectures)",
      titleAr: "تصوير البيوتي Beauty — 12 محاضرة",
      description:
        "A 12-lecture deep dive into beauty photography: studio setup, makeup collaboration, lighting for skin, retouching workflow, and building a beauty portfolio.",
      descriptionAr:
        "12 محاضرة متعمقة في تصوير البيوتي: تجهيز الاستوديو، التعاون مع خبيرة المكياج، إضاءة البشرة، سير عمل الريتوش، وبناء معرض أعمال البيوتي.",
      price: 899,
      level: CourseLevel.INTERMEDIATE,
      category: "بيوتي",
    },
    {
      slug: "makeup-tutorial-photography",
      title: "Makeup Tutorial Photography",
      titleAr: "ميكب توتوريال — تصوير دروس المكياج",
      description:
        "Specialized course on photographing makeup tutorials: macro lens work, color accuracy, step-by-step capture, and creating engaging tutorial content.",
      descriptionAr:
        "دورة متخصصة في تصوير دروس المكياج: العمل بعدسة الماكرو، دقة الألوان، الالتقاط خطوة بخطوة، وإنتاج محتوى توتوريال جذّاب.",
      price: 599,
      level: CourseLevel.INTERMEDIATE,
      category: "مكياج",
    },
  ];

  for (const c of courses) {
    const existing = await prisma.course.findUnique({ where: { slug: c.slug } });
    if (existing) continue;

    await prisma.course.create({
      data: {
        ...c,
        currency: "SAR",
        status: CourseStatus.PUBLISHED,
        isFeatured: true,
        language: "ar",
        instructorId: instructor.id,
        sections: {
          create: [
            {
              title: "المقدمة",
              titleAr: "المقدمة",
              order: 0,
              lessons: {
                create: [
                  {
                    title: "الترحيب والتعريف بالدورة",
                    slug: "welcome",
                    description: "تعريف عام بمحتويات الدورة وأهدافها",
                    type: "VIDEO",
                    order: 0,
                    isPreview: true,
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`✅ Course: ${c.titleAr}`);
  }

  // -------- 3. Featured testimonials --------
  const testimonials = [
    {
      name: "صفاء",
      role: "طالبة تصوير",
      rating: 5,
      comment:
        "تجربة استثنائية مع تصويرك. تعلمت أساسيات لم أكن أعرفها من قبل، والشرح عملي ومباشر. أنصح كل من يريد دخول عالم التصوير البدء من هنا.",
      isFeatured: true,
    },
    {
      name: "أماني بخش",
      role: "مصورة بيوتي",
      rating: 5,
      comment:
        "دورة تصوير البيوتي غيّرت أسلوبي تماماً. الأستاذ أحمد يشرح تفاصيل دقيقة في الإضاءة والريتوش بطريقة سهلة. صرت أعمل جلسات احترافية بعد الدورة.",
      isFeatured: true,
    },
    {
      name: "المها اليازيدي",
      role: "صانعة محتوى مكياج",
      rating: 5,
      comment:
        "دورة ميكب توتوريال ممتازة جداً. تعلمت كيف أصوّر دروس المكياج باحترافية مع الحفاظ على دقة الألوان. المحتوى غني والتطبيق عملي.",
      isFeatured: true,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.review.findFirst({ where: { name: t.name } });
    if (existing) continue;

    await prisma.review.create({
      data: {
        ...t,
        studentId: student.id,
        isPublished: true,
      },
    });
    console.log(`✅ Testimonial: ${t.name}`);
  }

  console.log("🎉 Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
