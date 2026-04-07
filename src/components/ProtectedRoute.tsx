import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
    const { user, loading } = useAuth();
    const role = localStorage.getItem('user_role');
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to={`/auth?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        if (user.email === "aditya@gmail.com") {
             // Admin override allowed through
        } else {
             return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
