import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication — re-exports from AuthContext.
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
