import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import AdminDashboard from '../pages/AdminDashboard';
import PersonalDashboard from '../pages/PersonalDashboard';
import CategoriesPage from '../pages/CategoriesPage';
import ProductsPage from '../pages/ProductsPage';
import MovementsPage from '../pages/MovementsPage';
import ReportsPage from '../pages/ReportsPage';

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

                {/* Categories Routes */}
                <Route
                    path="/categories"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <CategoriesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventory/:inventoryId/categories"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <CategoriesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Products Routes */}
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <ProductsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventory/:inventoryId/products"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <ProductsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Movements Routes */}
                <Route
                    path="/movements"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <MovementsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventory/:inventoryId/movements"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <MovementsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Reports Routes */}
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <ReportsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventory/:inventoryId/reports"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'maestro', 'jefe', 'estudiante']}>
                            <ReportsPage />
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
