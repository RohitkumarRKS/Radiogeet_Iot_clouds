import { useWebSocket as useWsContext } from '../context/WebSocketContext';

/**
 * Custom hook for WebSocket — re-exports from WebSocketContext.
 */
export function useWebSocket() {
  return useWsContext();
}

export default useWebSocket;
