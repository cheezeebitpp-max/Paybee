# PayBee - Admin & User Dashboard

A secure, high-performance full-stack web application designed for managing P2P USDT exchanges. Features comprehensive user management, real-time transaction tracking, and admin-controlled escrow logic.

## 🏗 Architecture

This project is optimized for a **decoupled deployment** on Hostinger, ensuring high security and independent scalability:

1.  **Frontend (Client)**: A modern Single Page Application (SPA) built with **React 19** and **Vite**. Served as a static build on the main domain (`paybee.live`).
2.  **Backend (API)**: A robust **Node.js** server using **Express** and **Prisma ORM**. Secured with **JWT** (including Supabase JWT support) and hosted on a dedicated API subdomain (`api.paybee.live`).
3.  **Legacy Reference**: The `/html` folder contains the original vanilla JS/HTML templates for historical reference.

## 🚀 Tech Stack

-   **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v6, Lucide Icons
-   **Backend**: Node.js 22.x, Express.js, Prisma ORM (PostgreSQL)
-   **Authentication**: Custom JWT + Supabase JWT verification support
-   **Database**: Supabase (PostgreSQL)

---

## 💻 Local Development Setup

To run PayBee locally, you must initiate both the frontend and backend environments.

### 1. Backend API & Database (`/server`)

1.  Navigate to the server directory:
    ```bash
    cd server
    npm install
    ```
2.  **Environment Variables**: Create a `.env` file in the `/server` folder:
    ```env
    DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0.pooler.supabase.com:6543/postgres?pgbouncer=true"
    DIRECT_URL="postgresql://postgres.[REF]:[PASS]@db.[REF].supabase.co:5432/postgres"
    JWT_SECRET="your_local_secret"
    SUPABASE_JWT_SECRET="your_supabase_project_jwt_secret"
    PORT=5000
    ```
3.  **Initialize & Start**:
    ```bash
    npx prisma generate
    npm run dev
    ```
    The API will be live at `http://localhost:5000`.

### 2. Frontend SPA (Root)

1.  Install dependencies in the root directory:
    ```bash
    npm install
    ```
2.  **Environment Variables**: Create a `.env` file in the root:
    ```env
    VITE_API_URL="http://localhost:5000"
    VITE_SUPABASE_URL="https://your-project.supabase.co"
    VITE_SUPABASE_ANON_KEY="your-anon-key"
    ```
3.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    The frontend will be live at `http://localhost:3000`.

---

## 🌍 Deployment (Hostinger)

### 1. API Subdomain (`api.paybee.live`)
-   **Type**: Node.js Web App
-   **Root Directory**: `/server`
-   **Post-install Command**: `npm install && npx prisma generate`
-   **Start Command**: `node index.js`
-   **Environment**: Add `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, and `SUPABASE_JWT_SECRET` in the Hostinger dashboard.

### 2. Main Domain (`paybee.live`)
-   **Type**: Static Site / Node.js
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`
-   **Environment**: Ensure `VITE_API_URL` points to your production API subdomain.

---

## 🛡 Security Note
All database operations are handled exclusively by the Backend API via Prisma. The frontend never communicates directly with the database except for public-facing Supabase features (like storage or auth listeners). Always ensure **CORS** is properly configured in `server/index.js` for your production domains.

© 2026 PayBee Core Systems. Authorized personnel only.