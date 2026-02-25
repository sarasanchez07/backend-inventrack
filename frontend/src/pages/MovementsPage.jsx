import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { X } from 'lucide-react';
import './Dashboards.css';

const MovementsPage = () => {
    const { inventoryId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    return (
        <DashboardLayout role={user?.role || 'personal'} isSpecificView={!!inventoryId} inventoryId={inventoryId}>
            <div className="page-header justify-between">
                <h2 className="page-title">Movimientos {inventoryId ? `del Inventario ${inventoryId}` : 'Generales'}</h2>
                {isAdmin && inventoryId && (
                    <button
                        type="button"
                        className="close-btn"
                        onClick={() => navigate('/admin')}
                        title="Volver al Inventario General"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
            <div className="mt-8 text-center text-gray-500">
                <p>Módulo de movimientos en desarrollo...</p>
            </div>
        </DashboardLayout>
    );
};

export default MovementsPage;
