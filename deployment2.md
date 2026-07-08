# 🚀 A to Z Deployment Guide: Kisan Alert Platform

This guide describes how to deploy the **Kisan Alert** platform to the public internet for free using **Vercel** (Frontend) and **Render** (Backend & Database).

---

## 🗂️ Table of Contents
1. [Repository Verification](#1-repository-verification)
2. [Step A: Create & Provision the Database](#step-a-create--provision-the-database)
3. [Step B: Build & Deploy the Express API Backend](#step-b-build--deploy-the-express-api-backend)
4. [Step C: Build & Deploy the Next.js Frontend](#step-c-build--deploy-the-next-js-frontend)
5. [Step D: Seed & Verify Database Data](#step-d-seed--verify-database-data)

---

## 1. Repository Verification
Before executing, confirm your local code has been pushed to GitHub.
- **Repository Link**: `github.com:neelshet007/kissanalert.git`
- **Active Branch**: `master`

---

## Step A: Create & Provision the Database
We will use **Render's PostgreSQL** managed service to host our database.

1. Go to **[Render.com](https://render.com/)** and sign in using your GitHub account.
2. Click **New** (top-right button) ➔ Select **PostgreSQL**.
3. Fill in the Database Details:
   - **Name**: `kisanalert-db`
   - **Database Name**: `kisanalert`
   - **User**: `dbuser`
   - **Region**: Choose the region closest to you (e.g., *Singapore* or *Oregon*).
   - **Instance Type**: Select **Free**.
4. Click **Create Database**.
5. Once the database status changes to **Available**, scroll down to the **Connection Info** section and copy the **External Database URL**. It will look like this:
   `postgresql://dbuser:password@hostname:5432/kisanalert?sslmode=require`

---

## Step B: Build & Deploy the Express API Backend
We will deploy the Node/Express backend service to **Render.com**.

1. On your Render dashboard, click **New** ➔ Select **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Choose your `kissanalert` repository from the list.
4. Configure the Web Service:
   - **Name**: `kisanalert-backend-api`
   - **Root Directory**: `backend` *(Critical: This points Render to the backend folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/src/server.js`
   - **Instance Type**: Select **Free**.
5. Scroll down and click **Advanced** ➔ Add the following **Environment Variables**:
   - `DATABASE_URL` = `[Paste the PostgreSQL Connection URL copied in Step A]`
   - `JWT_SECRET` = `kisan-alert-jwt-super-secret-key-123`
   - `GEMINI_API_KEY` = `YOUR_GEMINI_API_KEY`
6. Click **Create Web Service**.
7. Render will build the TypeScript project and host the API. Copy your backend live URL once deployment finishes (e.g., `https://kisanalert-backend-api.onrender.com`).

---

## Step C: Build & Deploy the Next.js Frontend
We will deploy the Next.js app to **Vercel.com**, which handles Edge compiling and static page delivery.

1. Go to **[Vercel.com](https://vercel.com/)** and log in with your GitHub account.
2. Click **Add New** ➔ Select **Project**.
3. Import your `kissanalert` repository.
4. Configure the Project Settings:
   - **Project Name**: `kisanalert-frontend`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select the `frontend` folder.
   - **Install Command**: In **Build & Development Settings**, turn ON the **Override** toggle for the Install Command, and enter:
     `npm install --legacy-peer-deps`
5. Expand the **Environment Variables** panel and add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://kisanalert-backend-api.onrender.com` *(Replace with your Render API URL from Step B without adding /api)*
6. Click **Deploy**.
7. Vercel will compile the production dashboard assets and launch the website on a public URL (e.g., `https://kisanalert-frontend.vercel.app`).

---

## Step D: Seed & Verify Database Data
Now that the database is live, we must apply migrations and seed the platform users.

1. In your local terminal, temporarily change your backend `.env` file's `DATABASE_URL` value to the **External Database URL** from Render.
2. Open terminal in the `backend/` directory and run:
   ```bash
   # Push schema directly to setup tables in Render's database
   npx prisma db push

   # Seed default users & records
   npm run db:seed
   ```
3. Your database is now populated! You can now log into your live website using the seeded credentials:
   - **Farmer Account**: `farmer@kisanalert.com` | **Password**: `password123`
   - **Expert Account**: `expert@kisanalert.com` | **Password**: `password123`
   - **Admin Account**: `admin@kisanalert.com` | **Password**: `password123`
