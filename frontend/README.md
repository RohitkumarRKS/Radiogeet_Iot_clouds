# 🎨 RadioGeet™ Frontend - Architecture & Developer Guide

This directory contains the **React 19 + Vite** single-page web application for the **RadioGeet™ IoT Cloud Platform**.

---

## 📁 Modular Directory Structure

```
frontend/
├── public/                    # Static public assets
│   ├── radiogeet.png          # Primary official logo asset
│   └── vite.svg               # Vite icon
├── src/
│   ├── api/                   # API client configuration
│   │   ├── client.js          # Axios instance with JWT interceptors & error handlers
│   │   └── index.js           # API service modules
│   ├── components/            # Reusable UI components
│   │   ├── Common/            # Modal, Card, Table, Badge, Button, Loader
│   │   └── Layout/            # Sidebar, Topbar, MainLayout, PageHeader
│   ├── context/               # React Context Providers
│   │   ├── AuthContext.jsx    # User session, JWT auth & profile state
│   │   ├── ThemeContext.jsx   # Theme state provider
│   │   ├── ToastContext.jsx   # Global toast notifications
│   │   └── WebSocketContext.js# Real-time WebSocket connection hook
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js         # Access auth state
│   │   ├── useTheme.js        # Access theme state
│   │   └── useWebSocket.js    # Access live telemetry streams
│   ├── pages/                 # Application Page Modules
│   │   ├── Dashboard/         # IoT Dashboard pages & widgets
│   │   ├── Devices/           # Device list, telemetry & profiles
│   │   ├── Alarms/            # Real-time alarm monitoring
│   │   ├── Settings/          # User profile & system settings
│   │   └── UserManagement/    # Admin user management
│   ├── styles/                # Global CSS & Design System
│   │   ├── index.css          # Design system tokens, variables & layout
│   │   └── sidebar.css        # Sidebar & navigation styles
│   ├── utils/                 # Utility functions & formatters
│   ├── App.jsx                # Main Application Router & Route Guards
│   └── main.jsx               # React DOM Entry Point
├── .env                       # Frontend environment variables (VITE_API_URL)
├── .env.example               # Template environment configuration
├── index.html                 # Main HTML template
├── package.json               # Frontend dependencies & scripts
└── vite.config.js             # Vite build & dev proxy configuration
```

---

## 🚀 How to Add a New Page / Feature

To add a new page or module to the frontend without modifying or breaking existing UI:

### 1. Create Page Component
Add your page file inside `src/pages/<ModuleName>/<NewPage>.jsx`:
```jsx
import React from 'react';

const NewFeaturePage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>New Feature</h1>
        <p>Manage your custom feature settings here.</p>
      </div>
      <div className="card">
        <h3>Feature Content</h3>
      </div>
    </div>
  );
};

export default NewFeaturePage;
```

### 2. Add Route to Router
In `src/App.jsx`, import your new page and add a route:
```jsx
import NewFeaturePage from './pages/ModuleName/NewPage';

// Inside <Routes>:
<Route path="/new-feature" element={<NewFeaturePage />} />
```

### 3. Add Navigation Link in Sidebar
In `src/components/Layout/Sidebar.jsx`, add your item to the menu navigation list:
```jsx
{
  path: '/new-feature',
  label: 'New Feature',
  icon: SparklesIcon,
}
```

---

## 🛠️ Build & Scripts

- `npm run dev`: Start Vite development server (Port 5173).
- `npm run build`: Build production static bundle to `frontend/dist`.
- `npm run preview`: Preview production build locally.
