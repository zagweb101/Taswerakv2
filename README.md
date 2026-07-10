# 📸 تصويرك | Taswerak

> منصة تعليمية متخصصة في تعليم التصوير الفوتوغرافي من الصفر للاحتراف — جدة، السعودية.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-indigo?logo=prisma)](https://www.prisma.io/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-black?logo=auth0)](https://authjs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🎯 نظرة عامة

منصة LMS لتعليم التصوير بإشراف المدرّب **أحمد زغلول**، تضم 3 دورات مرجعية:
- **أساسيات التصوير**
- **تصوير البيوتي Beauty** (12 محاضرة)
- **ميكب توتوريال**

### ✨ الميزات الرئيسية
- 🎓 **3 لوحات تحكم** بطالب/مدرّب/مدير — كل واحدة بـ Sidebar وإعدادات مختلفة
- 💳 **تدفق دفع يدوي كامل** — رفع إيصال بنكي → اعتماد/رفض من المدرّب → تفعيل تلقائي
- 📧 **نظام بريد** مع simulation mode للتطوير + SMTP للإنتاج
- 🛡️ **Rate Limiting** على signup + login + impersonate + export
- 🔒 **Security Headers كاملة** (CSP, HSTS, X-Frame-Options, etc.)
- 🎭 **انتحال (Impersonation)** للمدير مع banner تنبيهي
- 📊 **Excel Export** حقيقي للمعاملات المالية
- 📝 **Audit Log** شامل لكل الإجراءات الحساسة
- 🎓 **شهادات QR** قابلة للتحقق
- 🖼️ **Pin Comments** على صور الطلاب للنقد التفصيلي
- 🌍 **RTL + عربي** بالكامل (Cairo + Tajawal fonts)

---

## 🏗️ التقنيات المستخدمة

| الفئة | التقنية |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL 16 + Prisma 6 ORM |
| Auth | Auth.js v5 (NextAuth) + bcryptjs |
| Storage | MinIO (S3-compatible) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Email | Nodemailer (simulation/SMTP) |
| Excel | ExcelJS |
| Charts | Recharts |
| Deployment | Docker + Coolify (Hostinger VPS) |

---

## 🚀 التشغيل محلياً

### المتطلبات
- Node.js 20+ أو Bun 1.1+
- Docker (لـ PostgreSQL + MinIO)

### 1. تثبيت الاعتماديات
```bash
bun install
```

### 2. تشغيل PostgreSQL + MinIO
```bash
docker compose up -d
```

### 3. إعداد متغيرات البيئة
```bash
cp .env.example .env
# عدّل القيم الحساسة (AUTH_SECRET, MINIO_SECRET_KEY, إلخ)
```

### 4. تطبيق الـ migration + البيانات الأولية
```bash
bunx prisma migrate deploy
bun run db:seed
```

### 5. تشغيل المشروع
```bash
bun run dev
```

افتح: http://localhost:3000

---

## 👥 الحسابات التجريبية (بعد seed)

| الدور | البريد | كلمة المرور |
|---|---|---|
| مدير | `admin@taswerak.com` | `Password123!` |
| مدرّب | `ahmed@taswerak.com` | `Password123!` |
| طالب | `student@taswerak.com` | `Password123!` |

---

## 📦 النشر للإنتاج (Coolify / Hostinger VPS)

### Build Command
```bash
bun install && bunx prisma generate && bun run build
```

### Start Command
```bash
bunx prisma migrate deploy && bun .next/standalone/server.js
```

### Environment Variables (مطلوبة على الخادم)
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — 32+ char random string (`openssl rand -base64 32`)
- `MINIO_ACCESS_KEY` + `MINIO_SECRET_KEY`
- `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD`
- `EMAIL_TRANSPORT=smtp`
- `HOSTNAME=0.0.0.0`
- `PORT=3000`

---

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── api/                    7 routes
│   ├── (public)/               3 صفحات (login, signup, layout)
│   ├── (dashboard)/
│   │   ├── student/            6 صفحات
│   │   ├── instructor/         6 صفحات
│   │   └── admin/              6 صفحات
│   ├── courses/                قائمة + [slug]
│   ├── about/ + contact/
│   ├── page.tsx                الـ landing
│   ├── layout.tsx              root RTL
│   ├── not-found.tsx + error.tsx + loading.tsx
│   └── globals.css             brand utilities
├── components/
│   ├── ui/                     54 shadcn component
│   ├── landing/                11 مكوّن
│   ├── dashboard/              8 مكوّنات مشتركة
│   ├── auth/ + student/ + instructor/ + admin/
├── lib/
│   ├── db.ts                   Prisma singleton
│   ├── brand.ts                gradient tokens
│   └── services/
│       ├── minio.ts            تخزين S3
│       ├── email.ts            بريد + قوالب
│       ├── audit.ts            تدقيق + إشعارات
│       └── rate-limit.ts       rate limiting
├── auth.ts + auth.config.ts    Auth.js v5 (Node + Edge split)
├── middleware.ts               حماية المسارات
└── hooks/use-settings.ts       إدارة الإعدادات

prisma/
├── schema.prisma               19 model + 36 index
├── seed.ts                     admin + instructor + 3 دورات + 3 شهادات
└── migrations/                 2 migrations

Dockerfile + docker-compose.yml + .env.example
```

---

## 🔐 الأمان

- ✅ **bcrypt** بقوة 12 لكلمات المرور
- ✅ **Auth.js v5** مع JWT + Edge/Node split
- ✅ **Rate Limiting** على endpoints الحساسة
- ✅ **CSP + HSTS + X-Frame-Options** + 3 headers أخرى
- ✅ **Zod validation** على كل مدخلات API
- ✅ **Audit Log** على كل إجراء حساس
- ✅ **Role-based access control** على كل مسار
- ✅ لا SQL خام (Prisma Client فقط)
- ✅ لا XSS (لا `dangerouslySetInnerHTML` في كود الأعمال)

---

## 🎨 الـ Brand

الـ gradient الموحَّد عبر كل المنصة:
```
#0A9ED9 → #00A3AA → #D65221
```

---

## 📋 الحالة

✅ **5 مراحل مكتملة** + إصلاحات التدقيق الحرجة  
⚠️ **متبقٍّ (اختياري):** اختبارات (Jest/Playwright) — مفقودة  
⚠️ **متبقٍّ (يدوي):** استبدال الأسرار الافتراضية في `.env` قبل النشر

---

## 👨‍💻 المدرّب
**أحمد زغلول** — مصور محترف ومدرّب تصوير، جدة، السعودية.

---

© 2026 تصويرك — جميع الحقوق محفوظة.
