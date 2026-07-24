import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthRedirectProps {
  guestTo?: string;
  authTo?: string;
}

export default function AuthRedirect({
  guestTo = '/login',
  authTo = '/meetings',
}: AuthRedirectProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <Navigate to={isAuthenticated ? authTo : guestTo} replace />;
}
