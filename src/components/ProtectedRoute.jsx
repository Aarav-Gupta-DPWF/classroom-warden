import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading-spinner" />
        <p>Loading Warden Console…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" state={{ auth: 'required', from: location.pathname }} replace />;
  }

  return children;
}
