import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirigir a su dashboard correspondiente según su rol
        return <Navigate to={user.role === 'admin' ? '/admin' : '/personal'} replace />;
    }

    return children;
};

export default ProtectedRoute;
