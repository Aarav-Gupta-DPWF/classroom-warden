import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WardenLogo from './WardenLogo';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading">
        <WardenLogo height={64} />
        <div className="route-loading-spinner" />
        <p>Loading Warden Console…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ auth: 'required', from: location.pathname }} replace />;
  }

  return children;
}
