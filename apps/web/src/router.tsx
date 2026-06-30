import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Guard for protected pages (requires authentication)
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-white/5"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400 tracking-wider animate-pulse">
          LOADING STUDYOS...
        </p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Guard for public pages (redirects to profile if already authenticated)
export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-white/5"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400 tracking-wider animate-pulse">
          LOADING STUDYOS...
        </p>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/profile" replace /> : <Outlet />;
};
