import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboards based on role if they try hitting a forbidden route
        return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/customer/invoices'} replace />;
    }

    return children;
};

export default ProtectedRoute;
