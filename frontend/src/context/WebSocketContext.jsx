import { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);
  const userId = user?.id || user?.email;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Quick client-side expiry check — don't connect with expired token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return;
      }
    } catch (_) {
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const host = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
      const protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'wss:' : 'ws:';
      const port = (typeof window !== 'undefined' && window.location.port === '5173')
        ? ':2004'
        : (typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '');
      const ws = new WebSocket(`${protocol}//${host}${port}/api/ws?token=${token}`);

      ws.onopen = () => {
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
        // Re-subscribe all active entity listeners to server upon reconnect
        listenersRef.current.forEach((_, entityId) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'SUBSCRIBE', entityId }));
          }
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Notify entity-specific listeners
          if (data.entityId) {
            const entityListeners = listenersRef.current.get(data.entityId);
            if (entityListeners) {
              entityListeners.forEach((cb) => cb(data));
            }
          }

          // Notify global listeners
          const globalListeners = listenersRef.current.get('__global__');
          if (globalListeners) {
            globalListeners.forEach((cb) => cb(data));
          }
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      };

      ws.onclose = (evt) => {
        setConnected(false);
        wsRef.current = null;

        // Only log unexpected closures (skip 1006 from BFCache / intentional close)
        if (!intentionalCloseRef.current && evt.code !== 1006) {
          console.log(`WebSocket closed (code: ${evt.code})`);
        }
        intentionalCloseRef.current = false;

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

        // Only auto-reconnect if logged in and page is visible
        if (localStorage.getItem('token') && document.visibilityState !== 'hidden') {
          // Exponential backoff: 1s, 2s, 4s, 8s... max 30s
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        // Suppress noisy error logs — onclose will handle reconnection
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, []);

  // Gracefully close WebSocket (intentional)
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      intentionalCloseRef.current = true;
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Handle BFCache restoration and tab visibility changes
  useEffect(() => {
    // When page is restored from BFCache, reconnect WebSocket
    const handlePageShow = (event) => {
      if (event.persisted && userId && localStorage.getItem('token')) {
        // Page was restored from BFCache — old WS is dead, reconnect
        wsRef.current = null;
        reconnectAttemptsRef.current = 0;
        connect();
      }
    };

    // Handle tab visibility changes — disconnect when hidden, reconnect when visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab going to background — allow WS to stay open (server heartbeat will manage)
        // But clear any pending reconnect timers
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      } else if (document.visibilityState === 'visible') {
        // Tab becoming visible again — reconnect if WS is dead
        if (userId && localStorage.getItem('token') &&
            (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
          reconnectAttemptsRef.current = 0;
          connect();
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, connect]);

  const subscribe = useCallback((entityId, callback) => {
    if (!listenersRef.current.has(entityId)) {
      listenersRef.current.set(entityId, new Set());
    }
    listenersRef.current.get(entityId).add(callback);

    // Send subscribe message to server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'SUBSCRIBE', entityId }));
    }

    return () => {
      const listeners = listenersRef.current.get(entityId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          listenersRef.current.delete(entityId);
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'UNSUBSCRIBE', entityId }));
          }
        }
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
}

export default WebSocketContext;
