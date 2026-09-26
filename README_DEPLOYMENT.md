# 🚀 RadioGeet™ IoT Platform - aaPanel & Hostinger Server Deployment Guide

This guide explains step-by-step how to package, upload, and deploy the **RadioGeet™ IoT Cloud Platform** on **aaPanel** or **Hostinger VPS** using Node.js, PM2, and Nginx.

---

## 📁 Standard Modular Directory Structure

```
radiogeet-clouds/
├── frontend/                 # Frontend React 19 + Vite application
│   ├── dist/                 # Compiled SPA build output (generated via npm run build)
│   ├── public/               # Static assets & radiogeet.png logo
│   ├── src/                  # React Components, Pages, Styles, Contexts
│   ├── .env                  # Frontend environment settings (VITE_API_URL)
│   └── README.md             # Frontend modular expansion guide
├── backend/                  # Backend Express + Node.js server
│   ├── config/               # Database & Sequelize configuration
│   ├── controllers/          # Business logic API Controllers
│   ├── middleware/           # Auth JWT & Error handling middleware
│   ├── models/               # Sequelize Data Models (User, Device, Telemetry, etc.)
│   ├── routes/               # Express API Routes (/api/auth, /api/devices, etc.)
│   ├── seeds/                # Initial Database Seed Script
│   ├── websocket/            # Live telemetry WebSocket server
│   ├── .env                  # Backend environment settings (PORT, JWT_SECRET)
│   └── README.md             # Backend modular expansion guide
├── scripts/                  # Deployment & Automation Scripts
│   ├── dev.js                # Local Development Launcher
│   └── deploy-aapanel.sh     # One-Click aaPanel Automated Deployment Script
├── .env                      # Global Root Environment Variables
├── .env.example              # Template Environment Configuration
├── aapanel-nginx.conf        # Nginx Reverse Proxy Config for aaPanel
├── ecosystem.config.js       # PM2 Process Manager Configuration
└── package.json              # Root PM2 / aaPanel Project Configuration
```

---

## 📦 How to Upload & Deploy on aaPanel File Manager

### Step 1: Zip & Prepare Project
When you are ready to upload to your server:
1. Select all files in `radiogeet-clouds` **EXCEPT** `node_modules` folders.
2. Compress into a single zip file (e.g., `radiogeet-clouds.zip`).

### Step 2: Upload to aaPanel
1. Open **aaPanel -> Files**.
2. Navigate to `/www/wwwroot/yourdomain.com/`.
3. Click **Upload** and upload `radiogeet-clouds.zip`.
4. Click **Uncompress** to extract the files into `/www/wwwroot/yourdomain.com/`.

### Step 3: Install Node.js Project in aaPanel
1. Open **aaPanel -> Website -> Node Project -> Add Node Project**.
2. **Project Directory**: `/www/wwwroot/yourdomain.com`
3. **Project Name**: `radiogeet-iot-cloud`
4. **Run Command**: `npm start` (or PM2 with `ecosystem.config.js`)
5. **Port**: `3001`
6. Click **Submit**.

### Step 4: Run 1-Click Deployment Script
Open terminal inside aaPanel or SSH and run:
```bash
bash scripts/deploy-aapanel.sh
```
Or run manually:
```bash
npm run install:all
npm run build
pm2 start ecosystem.config.js
```

### Step 5: Configure Nginx Reverse Proxy
In aaPanel **Website Settings -> Config**, paste the contents of `aapanel-nginx.conf` into your site Nginx config.

---

## 🛠️ Environment Variables Configuration

Make sure your `backend/.env` file contains your domain settings:
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=radiogeet_production_jwt_secret_2026_key
CORS_ORIGIN=http://yourdomain.com,https://yourdomain.com
```

And your `frontend/.env` file:
```env
VITE_API_URL=/api
```

---

## 🔁 How to Update Code in the Future

When adding new pages or backend features later:
1. Make your changes in `frontend/src/` or `backend/`.
2. Push or upload updated files to `/www/wwwroot/yourdomain.com/`.
3. Run `npm run build` in frontend and `pm2 reload ecosystem.config.js`.
