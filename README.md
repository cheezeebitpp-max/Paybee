# PayBee Core API (`api.paybee.live`)

Production-ready backend API service for PayBee P2P USDT exchange platform. Built with Node.js, Express, and Prisma ORM connecting to PostgreSQL (Supabase).

## 🚀 Overview

- **Runtime**: Node.js 20+ / 22.x
- **Framework**: Express.js
- **ORM & Database**: Prisma ORM with PostgreSQL (Supabase)
- **Authentication**: JWT + Supabase Auth verification
- **Notifications**: Brevo SMTP transactional emails

---

## 🛠 Local Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in the required database URLs and secret keys:
   ```env
   DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[REF]:[PASS]@db.[REF].supabase.co:5432/postgres"
   JWT_SECRET="your_secure_jwt_secret"
   SUPABASE_JWT_SECRET="your_supabase_jwt_secret"
   PORT=5000
   FRONTEND_URL="https://app.paybee.live"
   BREVO_SMTP_USER="your_brevo_smtp_user"
   BREVO_SMTP_KEY="your_brevo_smtp_key"
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   API will run at `http://localhost:5000`.

---

## 🌍 Production Deployment (Hostinger Node.js Web App)

- **Application Type**: Node.js Web App
- **Domain / Subdomain**: `api.paybee.live`
- **Root Directory**: `/` (Repository root)
- **Node.js Version**: 20.x or 22.x
- **Install Command**: `npm install`
- **Build / Post-install Command**: `npm run build` (runs `npx prisma generate`)
- **Start Command**: `npm start` (or `node index.js`)
- **Environment Variables**: Add `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `SUPABASE_JWT_SECRET`, `PORT`, `FRONTEND_URL`, `BREVO_SMTP_USER`, and `BREVO_SMTP_KEY` in your hosting panel.

---

## 🔐 Security Considerations

- Never commit the `.env` file to version control.
- Ensure database connections use SSL in production.
- CORS origins are restricted to configured `FRONTEND_URL` and authorized domains.
- All database mutations use parameterized queries via Prisma ORM to prevent SQL injection.

---

© 2026 PayBee Core Systems.
