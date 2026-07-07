# 🚀 Kisan Alert - Free Cloud Deployment Guide

This guide describes how to deploy the entire **Kisan Alert** system (Next.js frontend, Express backend, PostgreSQL database, and n8n workflows) completely for **free** as a prototype using modern cloud platforms.

```mermaid
graph TD
    User([User Browser]) -->|Next.js Frontend| Vercel[Vercel Host]
    Vercel -->|API Requests| Render[Render Web Service]
    Render -->|SQL Queries| Neon[(Neon Serverless Postgres)]
    Render -->|API Calls / JSON| GeminiAPI[Google Gemini AI]
    Render -->|Triggers Workflows| n8n[n8n Workflow Service]
```

---

## 🛠️ Prerequisites
1. A **GitHub** account.
2. The project pushed to a private or public GitHub repository.

---

## 💾 Step 1: Deploy the Database (Neon)
We will use **Neon** (neon.tech) because it offers a generous, serverless PostgreSQL free tier that is perfect for prototypes.

1. Go to **[neon.tech](https://neon.tech/)** and sign up for a free account.
2. Click **Create Project**.
3. Name your project (e.g., `kisan-alert-db`) and select the PostgreSQL version (v15 or v16).
4. Choose the cloud region closest to your target audience.
5. Click **Create Project**.
6. Once created, copy the **Connection string** shown in the dashboard. It will look like this:
   ```env
   postgresql://neondb_owner:password@ep-cool-snowflake-a5xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. Keep this connection string safe. This will be your `DATABASE_URL`.

---

## ⚙️ Step 2: Deploy the Backend API (Render)
We will deploy the Node.js/Express API on **Render** (render.com) because it natively supports running Node servers and runs database migrations automatically.

1. Sign up for a free account on **[render.com](https://render.com/)**.
2. Click **New +** in the top right and select **Web Service**.
3. Connect your GitHub repository containing the **Kisan Alert** codebase.
4. Configure the Web Service settings:
   - **Name**: `kisan-alert-backend`
   - **Environment**: `Node`
   - **Region**: Same region as your Neon database (or closest to it).
   - **Branch**: `main` (or whichever branch you push to).
   - **Root Directory**: `backend` (⚠️ *Very Important: points Render to the backend subfolder*)
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Instance Type**: `Free`

5. Click **Advanced** to add **Environment Variables** (or use the Env Groups section):
   
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `10000` | The default port Render uses. |
   | `DATABASE_URL` | *[Your Neon Connection String]* | Add `?sslmode=require` if it isn't already appended. |
   | `JWT_SECRET` | *[Any Random Secure String]* | Used to sign login tokens (e.g. `kisan-secret-9921`). |
   | `GEMINI_API_KEY` | *[Your Gemini API Key]* | Required for soil recommendations & crop leaf diagnosis. |
   | `N8N_WEBHOOK_URL` | *[n8n Webhook URL or empty for now]* | Update this later when n8n is deployed. |

6. Click **Create Web Service**.
7. **Prisma DB Migration**: Once the build succeeds, run a database migration to set up the tables on Neon. You can do this by running a one-time shell command in the Render dashboard's **Shell** tab:
   ```bash
   npx prisma db push
   ```
   *(Alternatively, you can seed mock data by running `npm run db:seed` in the Render terminal to populate demo credentials).*
8. Once successfully deployed, Render will provide a public URL (e.g., `https://kisan-alert-backend.onrender.com`). **Copy this URL**.

---

## 🎨 Step 3: Deploy the Frontend (Vercel)
We will deploy the Next.js frontend on **Vercel** (vercel.com) which is the creator of Next.js and offers a fast, zero-config free deployment tier.

1. Go to **[vercel.com](https://vercel.com/)** and sign up/log in with your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the deployment settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`** (⚠️ *Very Important: points Vercel to the frontend subfolder*)
5. Under **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: *[Your Render Backend URL]* (e.g., `https://kisan-alert-backend.onrender.com`)
6. Click **Deploy**.
7. Once finished, Vercel will give you a live production link (e.g., `https://kisan-alert-frontend.vercel.app`).
8. Open the Vercel link in your browser. Your Kisan Alert dashboard is now live on the internet! 🌾

---

## 🔁 Step 4: Deploy n8n Workflow Automation (Optional)
If you want the daily weather advisory SMS or automated alerts to run continuously on the cloud:

### Option A: Render (Free Docker Deploy)
1. Go to Render. Click **New +** -> **Web Service**.
2. Select **Deploy an existing image** (or choose Docker).
3. Under Image URL, use the official n8n image: `docker.io/n8nio/n8n:latest`.
4. Name the service `kisan-alert-n8n` and choose the **Free** tier.
5. In **Environment Variables**, add:
   - `N8N_PORT`: `5678`
   - `WEBHOOK_URL`: *[Your Render Web Service URL]* (e.g. `https://kisan-alert-n8n.onrender.com/`)
6. Click deploy. Once running, open the URL, import the `n8n/weather_update_sms.json` workflow file, set your API credentials, and activate the workflow.

### Option B: Local Runner with Cloud Tunnel (Easiest for quick demos)
If you only need n8n running while showing the demo:
1. Run n8n locally on your computer using Docker:
   ```bash
   docker-compose up -d
   ```
2. Open a free public tunnel using **ngrok** or **localtunnel** so the Render backend can trigger your local n8n server:
   ```bash
   npx localtunnel --port 5678
   ```
3. Copy the generated public URL (e.g., `https://fluffy-cat-run.localtunnel.me`).
4. Update `N8N_WEBHOOK_URL` in your **Render backend** environment variables to `https://fluffy-cat-run.localtunnel.me/webhook/kisan-alert`.

---

## 🧪 Verification & Demo Testing
Now that your application is live on the internet, test the user flows:
1. Navigate to your Vercel URL.
2. Go to the login page and use the **Farmer Demo** or **Expert Demo** login buttons.
3. Because the mock fallbacks are preserved, the dashboard will load instantly and work seamlessly even if backend or database services spin down (as free tiers occasionally do when idle).
