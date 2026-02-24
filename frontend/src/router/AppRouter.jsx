import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import AdminDashboard from '../pages/AdminDashboard';
import PersonalDashboard from '../pages/PersonalDashboard';

import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Dashboard Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personal"
                    element={
                        <ProtectedRoute allowedRoles={['maestro', 'jefe', 'estudiante']}>
                            <PersonalDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventory/:inventoryId"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <PersonalDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Redirection */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
