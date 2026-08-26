import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#061811', color: '#c9a24b' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px' }}>Verifying Administrative Credentials...</p>
      </div>
    );
  }

  const isAuthorizedAdmin = isAuthenticated && (user?.isAdmin === true || user?.email === 'leaflydatabase@gmail.com');

  if (!isAuthorizedAdmin) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
