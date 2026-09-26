import { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const userId = user?.id || user?.email;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const host = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
      const protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${host}:2004/api/ws?token=${token}`);

      ws.onopen = () => {
        setConnected(true);
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
        console.log(`WebSocket closed (code: ${evt.code})`);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        // Only auto-reconnect if logged in
        if (localStorage.getItem('token')) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (err) => {
        console.warn('WS error:', err.message || err);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    } else if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
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
