import { Navigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingBlock } from './Loading';

/** Keeps signed-out visitors out of account pages and remembers where they were going. */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const routerLocation = useRouterLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24">
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: routerLocation.pathname }} />;
  }

  return children;
}
