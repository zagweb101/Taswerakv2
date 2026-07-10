# 🚀 دليل النشر على Coolify — تصويرك

> خطوة بخطوة لنشر منصة تصويرك على Hostinger VPS (153.92.208.71) عبر Coolify

---

## 📋 المتطلبات قبل البدء

| المتطلب | الحالة |
|---|---|
| خادم Hostinger VPS يعمل بـ Ubuntu 22+ | ✅ IP: 153.92.208.71 |
| صلاحية root على الخادم | ✅ |
| المستودع على GitHub | ✅ https://github.com/zagweb101/Taswerakv2 |
| دومين taswerak.com (اختياري للبداية) | ⚠️ يمكن البدء بدون دومين |

---

## 1️⃣ تثبيت Coolify على الخادم (15 دقيقة)

### الخطوة 1: اتصل بالخادم عبر SSH

```bash
ssh root@153.92.208.71
```

### الخطوة 2: حدّث النظام

```bash
apt update && apt upgrade -y
```

### الخطوة 3: ثبّت Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

سيستغرق التثبيت 5-10 دقائق. سيُثبّت تلقائياً:
- Docker
- Docker Compose
- Coolify نفسه

### الخطوة 4: افتح واجهة Coolify

افتح المتصفح على:
```
http://153.92.208.71:8000
```

أنشئ حساب admin:
- الاسم: `Taswerak Admin`
- البريد: بريك الإلكتروني الحقيقي
- كلمة المرور: قوية (احفظها في مدير كلمات المرور)

---

## 2️⃣ إعداد PostgreSQL (5 دقائق)

### الخطوة 1: أضف قاعدة البيانات

في Coolify:
1. اذهب لـ **Resources** → **+ Add New Resource**
2. اختر **Database** → **PostgreSQL 16**
3. الإعدادات:
   - **Name**: `taswerak-db`
   - **Database Name**: `taswerak`
   - **Username**: `taswerak`
   - **Password**: ضع كلمة مرور قوية (مثلاً: `openssl rand -base64 24`)
   - **Port**: `5432` (افتراضي)
4. اضغط **Deploy**

### الخطوة 2: انسخ الـ connection string

بعد التثبيت، اذهب لـ **Connections** tab وانسخ:
```
postgresql://taswerak:PASSWORD@taswerak-db:5432/taswerak?schema=public
```

احفظه — ستحتاجه في الخطوة 5.

---

## 3️⃣ إعداد MinIO للتخزين (10 دقائق)

### الخطوة 1: أضف MinIO كـ Application

في Coolify:
1. **Resources** → **+ Add New Resource** → **Application**
2. اختر **Docker Image Empty**
3. الإعدادات:
   - **Name**: `taswerak-minio`
   - **Image**: `minio/minio:latest`
   - **Command**: `server /data --console-address ":9001"`
4. اضغط **Deploy**

### الخطوة 2: اضبط Environment Variables

في تبويب **Environment Variables** لـ MinIO:

```env
MINIO_ROOT_USER=taswerak_minio
MINIO_ROOT_PASSWORD=<32-char-strong-password>
```

### الخطوة 3: اضبط Ports

في تبويب **Ports**:
- Port `9000` → expose
- Port `9001` → expose (console)

### الخطوة 4: أنشئ Bucket

افتح وحدة MinIO Console:
```
http://153.92.208.71:9001
```

سجّل دخول بـ:
- Username: `taswerak_minio`
- Password: الـ password الذي وضعته

ثم:
1. اذهب لـ **Buckets** → **Create Bucket**
2. الاسم: `taswerak-uploads`
3. اضبط الـ policy إلى **public** (لقراءة الصور)

---

## 4️⃣ ربط GitHub بـ Coolify (5 دقائق)

### الخيار الأبسط: Public Repository

1. في Coolify: **Resources** → **+ Add New Resource** → **Application**
2. اختر **Public Repository** (أو **GitHub App** لو ربطت حسابك)
3. الإعدادات:
   - **Repository URL**: `https://github.com/zagweb101/Taswerakv2.git`
   - **Branch**: `main`
   - **Build Pack**: `Dockerfile` (سيكتشفه تلقائياً)
4. اضغط **Continue**

### الخيار المتقدم: ربط حساب GitHub

1. اذهب لـ **Settings** → **GitHub App**
2. اضغط **Install GitHub App**
3. اختر حسابك: `zagweb101`
4. اختر repo: `Taswerakv2`

---

## 5️⃣ إعداد Build + Start Commands (2 دقيقة)

في تبويب **General** للـ application:

### Build Pack
اختر: **Dockerfile**

> Coolify سيقرأ ملف `Dockerfile` تلقائياً ويتجاهل إعدادات Build/Start اليدوية.
> لكن لو احتجت ضبطها يدوياً:

### Build Command (للنسخ الاحتياطي)
```bash
bun install && bunx prisma generate && bun run build
```

### Start Command (للنسخ الاحتياطي)
```bash
bunx prisma migrate deploy && bun .next/standalone/server.js
```

### Port
```
3000
```

### Health Check
```
Path: /api/health
Port: 3000
```

---

## 6️⃣ إضافة Environment Variables (الأهم!) — 5 دقائق

في تبويب **Environment Variables** للـ application، أضف **كل** القيم التالية:

> 💡 استخدم ملف `.env.production` الموجود في الـ repo كقالب — املأ القيم `<PLACEHOLDER>`.

### القسم 1: App
```env
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=3000
NEXTAUTH_URL=http://153.92.208.71
AUTH_TRUST_HOST=true
```

### القسم 2: الأسرار (generate محلياً)
```bash
# شغّل على terminal محلي لكل متغير:
openssl rand -base64 32
```

```env
AUTH_SECRET=<paste-output-1>
NEXTAUTH_SECRET=<paste-output-2>
```

### القسم 3: قاعدة البيانات (من الخطوة 2)
```env
DATABASE_URL=postgresql://taswerak:PASSWORD@taswerak-db:5432/taswerak?schema=public
DIRECT_URL=postgresql://taswerak:PASSWORD@taswerak-db:5432/taswerak?schema=public
```

### القسم 4: MinIO (من الخطوة 3)
```env
MINIO_ENDPOINT=http://taswerak-minio:9000
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=taswerak_minio
MINIO_SECRET_KEY=<password-from-step-3>
MINIO_BUCKET=taswerak-uploads
MINIO_PUBLIC_URL=http://153.92.208.71:9000
```

### القسم 5: البريد الإلكتروني
```env
EMAIL_TRANSPORT=smtp
EMAIL_FROM="Taswerak <no-reply@taswerak.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

> 📧 **للحصول على Gmail App Password**:
> 1. اذهب لـ https://myaccount.google.com/security
> 2. فعّل **2-Step Verification**
> 3. اذهب لـ **App passwords** → أنشئ واحدة باسم `Taswerak SMTP`

### القسم 6: البنك (بيانات حقيقية)
```env
BANK_NAME=البنك الأهلي السعودي
BANK_ACCOUNT_NAME=أحمد زغلول - تصويرك
BANK_IBAN=SA<real-iban>
BANK_ACCOUNT_NUMBER=<real-account>
```

### القسم 7: Branding + Feature Flags
```env
APP_NAME=تصويرك
APP_NAME_EN=Taswerak
APP_GRADIENT_FROM=#0A9ED9
APP_GRADIENT_MID=#00A3AA
APP_GRADIENT_TO=#D65221
APP_CITY=جدة
APP_COUNTRY=السعودية
ENABLE_SIGNUP=true
ENABLE_IMPERSONATION=true
ENABLE_CERTIFICATES=true
```

---

## 7️⃣ النشر الأول (Deploy) — 5 دقائق

1. اضغط زر **Deploy** الأحمر في أعلى الصفحة
2. ستفتح نافذة الـ logs — تابع:
   ```
   ✓ Cloning repo...
   ✓ Building Docker image...
   ✓ Running bun install...
   ✓ Running prisma generate...
   ✓ Running next build...
   ✓ Starting container...
   ✓ Running prisma migrate deploy...
   ✓ Server started on port 3000
   ```

3. عند انتهاء الـ build، اضغط **Open Application** في أعلى الصفحة

افتح: `http://153.92.208.71`

🎉 **الموقع يعمل!**

---

## 8️⃣ تشغيل الـ Seed (مرة واحدة فقط) — 2 دقيقة

### الخطوة 1: افتح Terminal في Coolify

في صفحة الـ application:
1. اذهب لتبويب **Terminal**
2. اضغط **Execute Command**
3. شغّل:

```bash
bun run db:seed
```

سيُنشئ:
- ✅ مدير: `admin@taswerak.com`
- ✅ مدرّب: `ahmed@taswerak.com` (أحمد زغلول)
- ✅ طالب تجريبي: `student@taswerak.com`
- ✅ 3 دورات (أساسيات، بيوتي، ميكب توتوريال)
- ✅ 3 شهادات مميزة (صفاء، أماني بخش، المها اليازيدي)

كلمة المرور للجميع: `Password123!`

### الخطوة 2: غيّر كلمات المرور فوراً

سجّل دخول بكل حساب وغيّر كلمة المرور من صفحة الإعدادات.

---

## 9️⃣ ربط الدومين taswerak.com (اختياري)

### الخطوة 1: إعدادات DNS

في لوحة تحكم مزوّد الدومين:

| Type | Name | Value |
|---|---|---|
| A | `@` | `153.92.208.71` |
| A | `www` | `153.92.208.71` |

### الخطوة 2: إضافة الدومين في Coolify

في صفحة الـ application → تبويب **Domains**:
1. اضغط **Add Domain**
2. اكتب: `taswerak.com`
3. اضبط **Let's Encrypt SSL** على **ON**
4. احفظ

كرّر لـ `www.taswerak.com`.

### الخطوة 3: حدّث NEXTAUTH_URL

في Environment Variables:
```env
NEXTAUTH_URL=https://taswerak.com
MINIO_PUBLIC_URL=https://taswerak.com/files
```

ثم اضغط **Redeploy**.

---

## 🔟 التحقق من النشر الناجح

### Health Check
افتح في المتصفح:
```
http://153.92.208.71/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "checks": [
    { "name": "database", "status": "ok", "latencyMs": 5 },
    { "name": "storage_config", "status": "ok" },
    { "name": "auth_config", "status": "ok" }
  ]
}
```

### اختبار تسجيل الدخول

1. افتح: `http://153.92.208.71/login`
2. سجّل دخول بـ:
   - البريد: `ahmed@taswerak.com`
   - كلمة المرور: `Password123!`
3. يجب أن تُوجَّه إلى `/instructor`

### اختبار إنشاء طالب جديد

1. افتح: `http://153.92.208.71/signup`
2. أنشئ حساب طالب جديد
3. تحقق من وصولك لـ `/student`

---

## 🆘 مشاكل شائعة وحلولها

### المشكلة: `prisma migrate deploy` فشل

**السبب**: `DATABASE_URL` غير صحيح أو PostgreSQL لا يعمل.

**الحل**:
1. تحقق من إعدادات Environment Variables
2. في Coolify → PostgreSQL → تحقق من الـ Status
3. تأكد أن `DATABASE_URL` يستخدم اسم الـ container (مثلاً `taswerak-db`) وليس `localhost`

### المشكلة: `MinIO connection refused`

**السبب**: MinIO لا يعمل أو الـ network غير متصل.

**الحل**:
1. تأكد أن MinIO container يعمل
2. في Coolify → Settings → Networks → تأكد أن الـ application و MinIO في نفس الـ network
3. جرّب استخدام IP بدلاً من hostname

### المشكلة: Build timeout

**الحل**:
1. في Coolify → Settings → ارفع **Build Timeout** لـ 600 ثانية
2. أو استخدم nixpacks.toml بدلاً من Dockerfile

### المشكلة: `bun: command not found` في container

**الحل**: الـ Dockerfile يستخدم `oven/bun:1.1-slim` في الـ runner stage. لو واجهت مشكلة، استخدم:
```bash
node server.js
```
بدلاً من:
```bash
bun server.js
```
في الـ Start Command.

### المشكلة: خطأ 404 على الصفحات

**السبب**: `next.config.ts` لا يحتوي على `output: "standalone"`.

**الحل**: تأكد أن ملف `next.config.ts` يحتوي:
```ts
const nextConfig = {
  output: "standalone",
  // ...
};
```

### المشكلة: `Email simulation` بدلاً من `SMTP`

**السبب**: `EMAIL_TRANSPORT=smtp` غير مضبوط.

**الحل**: أضف في Environment Variables:
```env
EMAIL_TRANSPORT=smtp
```

---

## ✅ Checklist بعد النشر

- [ ] الموقع يفتح على `http://153.92.208.71`
- [ ] `/api/health` يرجع `status: ok`
- [ ] `/login` يفتح
- [ ] تسجيل دخول بـ `ahmed@taswerak.com` ينجح
- [ ] `/instructor` يفتح بعد تسجيل الدخول
- [ ] `/signup` ينشئ طالب جديد
- [ ] `/admin` يعمل بـ `admin@taswerak.com`
- [ ] تم تشغيل `db:seed`
- [ ] تم تغيير كلمات المرور الافتراضية
- [ ] تم ربط الدومين (اختياري)
- [ ] تم تفعيل SSL (اختياري)
- [ ] تم تفعيل Backups لـ PostgreSQL (يومياً)

---

## 📞 الدعم

- 📧 البريد: `info@taswerak.com`
- 🐛 المشاكل: https://github.com/zagweb101/Taswerakv2/issues

---

© 2026 تصويرك — جميع الحقوق محفوظة.
