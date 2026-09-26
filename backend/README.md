# ⚙️ RadioGeet™ Backend - Architecture & Developer Guide

This directory contains the **Node.js + Express** backend REST API & WebSocket server for the **RadioGeet™ IoT Cloud Platform**.

---

## 📁 Modular Directory Structure

```
backend/
├── config/                    # Configuration modules
│   └── database.js            # Sequelize SQLite database connection
├── controllers/               # API Controllers (Business logic & responses)
│   ├── authController.js      # Login, registration, profile updates
│   ├── deviceController.js    # Device management & telemetry querying
│   ├── alarmController.js     # Alarm acknowledgement & management
│   ├── telemetryController.js# Time-series telemetry push & retrieval
│   └── userController.js     # Admin user management
├── middleware/                # Express Middlewares
│   ├── authMiddleware.js      # JWT token authentication & admin guards
│   ├── errorHandler.js       # Centralized error handling
│   └── uploadMiddleware.js    # File upload handling (multer/storage)
├── models/                    # Sequelize Data Models
│   ├── User.js                # User model with profile & credentials
│   ├── Device.js              # IoT Device model
│   ├── Telemetry.js           # Time-series telemetry records
│   ├── Alarm.js               # Severity-based alarm records
│   └── index.js               # Model relationships & exports
├── routes/                    # Express Router Endpoints
│   ├── authRoutes.js          # /api/auth routes
│   ├── deviceRoutes.js        # /api/devices routes
│   ├── alarmRoutes.js         # /api/alarms routes
│   ├── telemetryRoutes.js     # /api/telemetry routes
│   └── index.js               # Central API router registry
├── seeds/                     # Initial Database Seeder
│   └── seed.js                # Database seeder script
├── services/                  # Business logic services
│   ├── emailService.js        # Email notification service
│   └── storageService.js      # File storage helpers
├── websocket/                 # Real-Time WebSocket Server
│   └── wsServer.js            # Live telemetry push WebSocket connection
├── .env                       # Backend environment configuration
├── .env.example               # Template environment configuration
├── database.sqlite            # SQLite database file
├── package.json               # Backend dependencies & npm scripts
└── server.js                  # Main Express entry point
```

---

## 🚀 How to Add a New API Endpoint / Model

To add a new backend feature, API route, or database model cleanly:

### 1. Create a Model (if requiring database storage)
Add `backend/models/NewEntity.js`:
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NewEntity = sequelize.define('NewEntity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT },
});

module.exports = NewEntity;
```

### 2. Create Controller Handler
Add `backend/controllers/newEntityController.js`:
```javascript
const NewEntity = require('../models/NewEntity');

exports.getEntities = async (req, res, next) => {
  try {
    const items = await NewEntity.findAll();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
```

### 3. Create Router File
Add `backend/routes/newEntityRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/newEntityController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, controller.getEntities);

module.exports = router;
```

### 4. Register Route in `server.js` or `backend/routes/index.js`
In `backend/routes/index.js`:
```javascript
router.use('/new-entity', require('./newEntityRoutes'));
```

---

## 🛠️ Build & Scripts

- `npm run dev`: Run server with Nodemon live-reloading (Port 3001).
- `npm start`: Run production server with Node.js.
- `npm run seed`: Reset & seed database with initial demo data.
