# CloudBoard — IoT Cloud Platform

A fully functional IoT cloud platform inspired by [ThingsBoard Cloud](https://thingsboard.cloud), built with React + Vite frontend and Node.js + Express backend.

## Features

- **Device Management** — Create, edit, delete devices with profiles, access tokens, and telemetry tracking
- **Real-Time Telemetry** — Time-series data collection via REST API with WebSocket live updates
- **Interactive Dashboards** — Configurable dashboards with value cards, line charts, gauges, and alarm widgets
- **Alarm System** — Severity-based alarms with CRITICAL/MAJOR/MINOR/WARNING levels and acknowledge/clear lifecycle
- **Visual Rule Chain Editor** — Drag-and-drop node-based rule engine with SVG connections
- **Multi-Tenant Architecture** — JWT authentication with tenant isolation
- **Asset Management** — Organize IoT infrastructure with logical asset grouping
- **Customer Management** — Assign devices and dashboards to customers
- **Notification Center** — In-app notifications with read/unread tracking
- **Audit Logs** — Complete activity history for security compliance
- **WebSocket Real-Time** — Live telemetry updates pushed to dashboard widgets

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Recharts, Lucide Icons |
| Backend | Node.js, Express, Sequelize ORM, SQLite |
| Real-Time | WebSocket (ws library) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Vanilla CSS (dark theme, 1750+ lines design system) |

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Development Servers

```bash
# Option A — Start both in one command (from root)
npm run dev

# Option B — Or in separate terminals
# Terminal 1 — Backend & MQTT (port 2004 / 1883)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### 3. Open in Browser

Navigate to **http://localhost:5173**

### Demo Credentials

| Email | Password |
|-------|----------|
| admin@cloudboard.io | demo1234 |

The database auto-seeds with demo data on first launch: 12 devices, 1200+ telemetry data points, 8 alarms, 2 dashboards, 2 rule chains, 3 customers, 5 assets, and more.

## Project Structure

```
Clouds/
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── api/               # Axios API client with JWT interceptors
│   │   ├── components/        # Layout (Sidebar, Topbar), ErrorBoundary
│   │   ├── context/           # Auth, WebSocket, Toast providers
│   │   ├── pages/             # 13 page modules (Home, Devices, Alarms, etc.)
│   │   ├── styles/            # Global CSS design system
│   │   ├── App.jsx            # Router configuration
│   │   └── main.jsx           # Entry point
│   └── index.html
│
├── server/                    # Node.js + Express Backend
│   ├── config/                # Database configuration
│   ├── controllers/           # 10 route controllers
│   ├── middleware/             # JWT auth, error handler
│   ├── models/                # 11 Sequelize models with associations
│   ├── routes/                # 10 route modules
│   ├── seeds/                 # Demo data seeder
│   ├── websocket/             # WebSocket server
│   └── server.js              # Express entry point
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register user + tenant |
| GET | `/api/devices` | List devices (paginated) |
| POST | `/api/devices` | Create device |
| GET | `/api/telemetry/:id/latest` | Latest telemetry values |
| GET | `/api/telemetry/:id/timeseries` | Historical telemetry |
| POST | `/api/telemetry/v1/:token/telemetry` | Push telemetry (device API) |
| GET | `/api/alarms` | List alarms |
| PUT | `/api/alarms/:id/ack` | Acknowledge alarm |
| GET | `/api/dashboards` | List dashboards |
| GET | `/api/rule-chains` | List rule chains |
| GET | `/api/assets` | List assets |
| GET | `/api/customers` | List customers |
| GET | `/api/notifications` | List notifications |
| GET | `/api/audit-logs` | List audit logs |
| GET | `/api/stats` | Platform statistics |

## Pushing Telemetry

Devices can push telemetry using their access token:

```bash
curl -X POST http://localhost:3001/api/telemetry/v1/YOUR_ACCESS_TOKEN/telemetry \
  -H "Content-Type: application/json" \
  -d '{"temperature": 25.4, "humidity": 62.1}'
```

## WebSocket

Connect to `ws://localhost:3001/api/ws?token=JWT_TOKEN` for real-time updates.

```javascript
// Subscribe to device telemetry
ws.send(JSON.stringify({ type: 'SUBSCRIBE', entityId: 'device-uuid' }));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'TELEMETRY_UPDATE', entityId: '...', data: [...] }
};
```

## License

MIT
