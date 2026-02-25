import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Package, Folder, ArrowUpRight, ArrowDownLeft, Plus, X, Sun } from 'lucide-react';
import './Dashboards.css';
import dashboardService from '../services/dashboardService';

const PersonalDashboard = () => {
    const { inventoryId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_products: 0,
        total_movements: 0,
        inventories: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getStats(inventoryId);
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [inventoryId]);

    // Obtenemos el nombre del inventario específico o el primero asignado
    let currentInventory = null;
    if (inventoryId) {
        currentInventory = stats.inventories.find(inv => inv.id.toString() === inventoryId);
    } else if (stats.inventories.length > 0) {
        currentInventory = stats.inventories[0];
    }

    const inventoryName = currentInventory
        ? `Inventario ${currentInventory.name}`
        : 'Inventario Asignado';

    const handleClose = () => {
        navigate('/admin');
    };

    return (
        <DashboardLayout role={user?.role || 'personal'} isSpecificView={!!inventoryId} inventoryId={inventoryId}>
            <div className="page-header justify-between">
                <h2 className="page-title">{loading ? 'Cargando...' : inventoryName}</h2>
                {user?.role === 'admin' && inventoryId && (
                    <button
                        type="button"
                        className="close-btn"
                        onClick={handleClose}
                        title="Volver al Inventario General"
                        aria-label="Cerrar inventario específico"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Cantidad Total de productos</span>
                        <span className="stat-value">{stats.total_products}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total de movimientos</span>
                        <span className="stat-value">{stats.total_movements}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <button className="btn-alerts">
                    <Sun size={18} />
                    Ver Alertas de Stock
                </button>
            </div>
        </DashboardLayout>
    );
};

export default PersonalDashboard;
