import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

/**
 * ProtectedRoute component to protect routes based on authentication 
 * and permissions.
 * 
 * Props:
 * - children: The component to render if authorized
 * - requireStaff: If true, only staff/superuser can access
 * - requireSuperuser: If true, only superuser can access
 * - redirectTo: Path to redirect if not authorized (default: '/')
 */
const ProtectedRoute = ({ 
    children, 
    requireStaff = false, 
    requireSuperuser = false,
    redirectTo = '/' 
}) => {
    const { user, isAuthenticated, isStaff, isSuperuser, isActive } = useAuth();

    // Not authenticated at all
    if (!isAuthenticated()) {
        return <Navigate to={redirectTo} replace />;
    }

    // User is inactive (redirect to inactive page)
    if (!isActive()) {
        return <Navigate to="/inactive" replace />;
    }

    // Requires superuser but user is not superuser
    if (requireSuperuser && !isSuperuser()) {
        return <Navigate to="/participant" replace />;
    }

    // Requires staff but user is not staff
    if (requireStaff && !isStaff()) {
        return <Navigate to="/participant" replace />;
    }

    // User is authorized
    return children;
};

export default ProtectedRoute;
