# Kisan Alert - Easy Beginner Setup Guide

Welcome to **Kisan Alert**! This guide is written in plain, simple language for absolute beginners. You do not need to be a programmer or know how to write code to get this project up and running on your computer.

---

## 🛠️ Step 1: Install the Free Software You Need

Before starting, you need to download and install three free programs on your computer:

1. **Node.js** (This runs the application):
   - Go to [nodejs.org](https://nodejs.org/).
   - Download and install the version labeled **LTS** (Recommended for Most Users).
   - Follow the default installation wizard clicks.

2. **Docker Desktop** (This automatically sets up databases & n8n without coding):
   - Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).
   - Download and install it for Windows/Mac.
   - Open Docker Desktop and let it run in the background (you will see a green icon in your taskbar).

---

## 📦 Step 2: Running the Project Locally

We have two parts: the **Backend** (API server) and the **Frontend** (what you see in the browser).

### 1. Start the Database & n8n Services
Open your terminal (PowerShell on Windows, or Terminal on Mac) in the project folder and run:
```bash
docker-compose up -d
```
*This command downloads and runs your database and n8n automatically inside Docker.*

### 2. Set Up the Backend Server
In the same terminal, type these commands line-by-line:
```bash
# Go into the backend folder
cd backend

# Create your settings file (on Windows)
copy .env.example .env

# (On Mac/Linux, use: cp .env.example .env)
```
Open the newly created `.env` file in a text editor (like Notepad or VS Code) and paste your Google Gemini API Key inside:
`GEMINI_API_KEY="your_actual_api_key"`

Now install the packages and compile the backend:
```bash
npm install
npx prisma generate
npm run dev
```
*Keep this terminal window open! The backend server is now running on `http://localhost:5000`.*

### 3. Set Up the Frontend (Dashboard App)
Open a **new** terminal window, navigate to the `frontend/` directory, and run:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
*The `--legacy-peer-deps` flag is important to bypass dependency conflicts.*
Now, open your web browser and go to: **`http://localhost:3000`** to see your app!

---

## ⚙️ Step 3: Setting Up n8n (Visual Automation)

1. Open your browser and go to `http://localhost:5678`.
2. **First-Time Setup**: Because it is the first time n8n is running on your machine, it will display a **"Set up owner account"** screen. Simply enter your email and set any password you like to create your local n8n account.
3. Once logged in, click on **Workflows** in the sidebar -> click **Add Workflow** (or **New**) -> click the three dots icon in the top right -> select **Import from File**.
4. Choose the [weather_update_sms.json](file:///c:/Web%20Devlopment/BuidWithAiHackathon/n8n/weather_update_sms.json) file from the `n8n/` folder in your project directory.
5. Double-click the **Gemini** or **SMS** nodes inside n8n to enter your API keys.
6. Click **Active** in the top right to start the automation.

---

## 🌾 Step-by-Step User Journey Guide

Here is how to test the application:

### 1. Log In as a Farmer
- Go to `http://localhost:3000/auth/login`.
- Click the **Farmer Demo** button to auto-fill the login fields, then click **Sign In**.
- Choose your preferred language (Hindi, Telugu, Marathi, or Tamil) in the top-right select box.
- Click **Create Farm** to define a farm (e.g. Size: 5 acres, Soil: Black Cotton).
- Click **Upload Soil Report** and enter values (e.g. pH: 6.8, Nitrogen: 120, Phosphorus: 35, Potassium: 240, Organic Carbon: 0.65).
- Click **Get Recommendation** to see what crop you should grow!
- Go to the **AI Disease Detection** card, upload a picture of a leaf, and get treatment suggestions. Since it is a simulation, it will automatically raise a ticket for an expert.
- Type in the **Voice Assistant** card: *"How do I improve soil nitrogen?"* to get a localized voice advice response.

### 2. Log In as an Expert
- Sign out of the Farmer dashboard.
- Go to the Login page and click **Expert Demo**, then sign in.
- You will see the **Expert Dashboard** with the farmer's escalated ticket.
- Read the AI details, type in your manual recommendation note, and click **Resolve Ticket**.

### 3. Log In as an Admin
- Sign out and log in using the **Admin Demo** button.
- View system latency graphs, active users, Gemini API usage charts, and notification counts!
