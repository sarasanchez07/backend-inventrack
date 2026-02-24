import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './Dashboards.css';
import { Sun, X } from 'lucide-react';
import dashboardService from '../services/dashboardService';

const PersonalDashboard = () => {
    const { inventoryId } = useParams();
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

    return (
        <DashboardLayout role="personal">
            <div className="page-header justify-between">
                <h2 className="page-title">{loading ? 'Cargando...' : inventoryName}</h2>
                <button className="close-btn"><X size={20} color="#f38d31" /></button>
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
