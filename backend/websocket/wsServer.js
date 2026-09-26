const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

function setupWebSocket(server, app) {
  const wss = new WebSocket.Server({ server, path: '/api/ws' });

  // Handle server error events on wss to prevent Unhandled 'error' crash
  wss.on('error', (err) => {
    if (err.code !== 'EADDRINUSE') {
      console.warn('WebSocket server warning:', err.message);
    }
  });

  // Track subscriptions: { entityId: Set<ws> }
  const subscriptions = new Map();

  wss.on('connection', (ws, req) => {
    // Extract token from query string
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      ws.user = decoded;
      ws.isAlive = true;
      ws.subscribedEntities = new Set();

      console.log(`WebSocket connected: ${decoded.email}`);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (rawData) => {
        try {
          const message = JSON.parse(rawData.toString());

          switch (message.type) {
            case 'SUBSCRIBE':
              if (message.entityId) {
                if (!subscriptions.has(message.entityId)) {
                  subscriptions.set(message.entityId, new Set());
                }
                subscriptions.get(message.entityId).add(ws);
                ws.subscribedEntities.add(message.entityId);

                ws.send(JSON.stringify({
                  type: 'SUBSCRIBED',
                  entityId: message.entityId,
                }));
              }
              break;

            case 'UNSUBSCRIBE':
              if (message.entityId && subscriptions.has(message.entityId)) {
                subscriptions.get(message.entityId).delete(ws);
                ws.subscribedEntities.delete(message.entityId);
              }
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('WebSocket message error:', err.message);
        }
      });

      ws.on('close', () => {
        // Cleanup subscriptions
        ws.subscribedEntities.forEach((entityId) => {
          if (subscriptions.has(entityId)) {
            subscriptions.get(entityId).delete(ws);
            if (subscriptions.get(entityId).size === 0) {
              subscriptions.delete(entityId);
            }
          }
        });
        console.log(`WebSocket disconnected: ${decoded.email}`);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'Welcome to CloudBoard WebSocket',
      }));

    } catch (err) {
      ws.close(4001, 'Invalid token');
    }
  });

  // Heartbeat to detect stale connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        ws.subscribedEntities?.forEach((entityId) => {
          if (subscriptions.has(entityId)) {
            subscriptions.get(entityId).delete(ws);
          }
        });
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  // Broadcast function — called by controllers to push data to subscribers
  const broadcast = (entityId, data) => {
    const message = JSON.stringify(data);
    const subs = subscriptions.get(entityId);
    if (subs && subs.size > 0) {
      subs.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
    // Also broadcast to all open WS connections for live dashboard updates
    broadcastAll(data);
  };

  // Broadcast to all connected clients
  const broadcastAll = (data) => {
    const message = JSON.stringify(data);
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  };

  setupWebSocket.broadcast = broadcast;
  setupWebSocket.broadcastAll = broadcastAll;

  // Make broadcast available to Express routes & global services
  app.locals.wsBroadcast = broadcast;
  app.locals.wsBroadcastAll = broadcastAll;
  global._activeWsBroadcast = broadcast;
  global._activeWsBroadcastAll = broadcastAll;

  return wss;
}

setupWebSocket.broadcast = (entityId, data) => {
  if (global._activeWsBroadcast) global._activeWsBroadcast(entityId, data);
};

setupWebSocket.broadcastAll = (data) => {
  if (global._activeWsBroadcastAll) global._activeWsBroadcastAll(data);
};

module.exports = setupWebSocket;
