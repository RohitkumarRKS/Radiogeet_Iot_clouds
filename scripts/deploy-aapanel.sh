#!/bin/bash
echo "========================================="
echo "   RadioGeet IoT Cloud aaPanel Deploy"
echo "========================================="

echo "[1/3] Installing dependencies..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "[2/3] Building frontend assets..."
cd frontend && npm run build && cd ..

echo "[3/3] Starting PM2 process manager..."
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js

echo "✅ aaPanel Deployment complete! Backend on port 3001, Frontend built in client/dist."
