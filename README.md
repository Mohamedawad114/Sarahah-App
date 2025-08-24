# مشروع صراحة – Saraha-Style Anonymous Messaging

تطبيق *Backend* مبني بـ *Node.js* يوفّر منصة رسائل مجهولة (على غرار تطبيق صراحة)، مع دعم تسجيل الدخول بجوجل، الرسائل المجهولة والرد عليها، الإشعارات، إدارة الجلسات والأمان المتقدّم.

---

## ✨ المميزات / Features

* *المصادقة (Auth)*:

  * تسجيل الدخول عبر *Google OAuth 2.0*.
  * استخدام *JWT* (Access + Refresh Tokens) مع تخزينها في *Redis* و*Cookies*.
* *الجلسات (Sessions)*:

  * تسجيل الخروج من جميع الأجهزة (Logout All Devices).
  * تخزين refresh tokens/blacklist في Redis.
* *OTP*:

  * إصدار *OTP* للتحقق من الهوية (مثلاً لتأكيد البريد أو الهاتف).
  * تخزين OTP في Redis مع *TTL*.
  * إرسال OTP عبر *البريد الإلكتروني (Email)*.
* *الرسائل المجهولة (Anonymous Messaging)*:

  * إرسال رسالة مجهولة لأي مستخدم.
  * إمكانية الرد على الرسالة بدون كشف هوية الراسل.
* *الإشعارات (Notifications)*:

  * إشعار المستخدم عند استلام رسالة جديدة أو رد.
  * دعم قراءة/عدم قراءة (read/unread).
* *الوسائط (Media)*:

  * رفع صورة شخصية (Avatar) باستخدام *Cloudinary*.
* *الأمان (Security)*:

  * Middleware للتحقق من صحة البيانات (Validation).
  * *Global Error Handling* موحّد.
  * استخدام *Helmet, Rate Limiting, Input Sanitization*.
  * تشفير (Encryption) لرقم الهاتف باستخدام AES.
  * تشفير كلمات المرور بالـ Hash (bcrypt).
* *المعاملات (Transactions)*:

  * عند حذف مستخدم يتم حذف رسائله، إشعاراته، وإبطال الـ Tokens في معاملة واحدة.
* *الملاحظة (Observability)*:

  * تسجيل الأحداث (Logging) باستخدام morgan.
  * Health-check endpoints.

---

## 🧱 نظرة عامة على المعمارية / Architecture Overview

* *API*: Node.js + Express.
* *DB*: MongoDB (مع دعم المعاملات).
* *Cache/Queue*: Redis (للجلسات، OTP، rate limits).
* *Storage*: Cloudinary (لتخزين الصور الشخصية).



src/
  app.js             # تهيئة التطبيق
  server.js          # تشغيل السيرفر
  config/            # إعدادات (db, redis, cloudinary, env)
  modules/
    users/           # المستخدمين
    messages/        # الرسائل
  middlewares/       # التحقق، الأخطاء، الأمان
  utils/              # send-email, redis, cloudinary, encryption,decryption



---

## 🗄 نموذج البيانات / Data Model

text
User {
  _id, name, email, provider, providerSub, image{url,publicId},
  phoneEnc, passwordHash?, createdAt, updatedAt
}
Message {
  _id, receiverId -> User._id, content,
   createdAt, updatedAt
}
Notification {
  _id, userId -> User._id, type: 'NEW_MESSAGE',
  messageId -> Message._id, isRead, createdAt
}


---

## 🔐 قائمة الأمان / Security Checklist

* JWT قصير العمر (15 دقيقة) + Refresh طويل (7 أيام).
* تخزين JWT في *HttpOnly Secure Cookies*.
* Blacklist في Redis للجلسات الملغية.
* Helmet, CORS Allowlist,  HPP Protection.
* Rate-limiting للـ Login, OTP, الرسائل.
* Validation صارم (Joi).
* تشفير الهاتف (AES-GCM).
* Hash للباسورد.
* رفع صور Cloudinary بتوقيع آمن.


---

## 🔁  Key Flows

### 1) تسجيل الدخول بجوجل / Google Login

1. /auth/google → Google OAuth.
2. إنشاء/إيجاد مستخدم.
3. إصدار Access+Refresh JWT.

### 2) إرسال رسالة مجهولة / Send Anonymous Message

1. POST /messages/:username → إنشاء رسالة.
2. إنشاء إشعار جديد للمستقبل.

### 3) الرد على رسالة / Reply to Message

1. POST /messages/:id/reply.
2. الرد يُحفظ كرسالة جديدة مرتبطة بالرسالة الأصلية.

### 4) إرسال OTP عبر الإيميل / Send OTP via Email

1. POST /auth/otp/issue.
2. توليد OTP → تخزينه في Redis مع TTL.
3. إرسال OTP للمستخدم عبر البريد الإلكتروني.

### 5) حذف مستخدم (Transaction)

1. بدء Session & Transaction.
2. حذف المستخدم ورسائله وإشعاراته.
3. إبطال الجلسات.

---

## 📚 API (عينات / Sample)

* GET /auth/google
* POST /auth/logout-all
* POST /auth/otp/issue (إرسال OTP بالإيميل)
* POST /auth/otp/verify (تأكيد OTP)
* POST /messages/:username
* POST /messages/:id/reply
* GET /notifications

---

## ⚙ Environment Variables

bash

PORT=3000
MONGODB_URI=mongodb://localhost:27017/sarahah
SECRET_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...


---

## 🚀 Run Locally

bash
npm install
npm run dev


## 📝 اDocumentation


* JSON Schemas لكل Route (Request/Response).

---
🚀 Deployment:



المشروع مستضاف حاليًا على EvenNode،  عبر :http://sarahah.eu-4.evennode.com/

