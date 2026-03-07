import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Sun, X } from 'lucide-react';
import './Dashboards.css';
import dashboardService from '../../services/dashboardService';
import alertService from '../../services/alertService';
import AlertModal from '../../components/alerts/AlertModal';

const PersonalDashboard = () => {
    const { inventoryId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_products: 0,
        total_movements: 0,
        low_stock_count: 0,
        expiring_count: 0,
        expiring_only_count: 0,
        normal_stock_count: 0,
        inventories: []
    });
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, alertsData] = await Promise.all([
                dashboardService.getStats(inventoryId),
                alertService.getAlerts(inventoryId)
            ]);
            setStats(statsData);
            setAlerts(alertsData);
        } catch (error) {
            console.error("Error fetching context data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [inventoryId]);

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
        <DashboardLayout
            role={user?.role || 'personal'}
            isSpecificView={!!currentInventory}
            inventoryId={inventoryId || currentInventory?.id?.toString()}
        >
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
                    <div className="progress-bar-container">
                        <div className="progress-bar-main">
                            <div
                                className="progress-segment low-stock"
                                style={{ width: `${stats.total_products > 0 ? (stats.low_stock_count / stats.total_products) * 100 : 0}%` }}
                                title={`Stock bajo: ${stats.low_stock_count}`}
                            ></div>
                            <div
                                className="progress-segment expiring-soon"
                                style={{ width: `${stats.total_products > 0 ? (stats.expiring_only_count / stats.total_products) * 100 : 0}%` }}
                                title={`Vence pronto: ${stats.expiring_count}`}
                            ></div>
                            <div
                                className="progress-segment normal-stock"
                                style={{ width: `${stats.total_products > 0 ? (stats.normal_stock_count / stats.total_products) * 100 : 0}%` }}
                                title={`Stock normal: ${stats.normal_stock_count}`}
                            ></div>
                        </div>
                        <div className="progress-legend">
                            <div className={`legend-item ${stats.low_stock_count === 0 ? 'zero-count' : ''}`}>
                                <span className="dot low-stock"></span> Stock bajo
                            </div>
                            <div className={`legend-item ${stats.expiring_count === 0 ? 'zero-count' : ''}`}>
                                <span className="dot expiring-soon"></span> Vence pronto
                            </div>
                            <div className={`legend-item ${stats.normal_stock_count === 0 ? 'zero-count' : ''}`}>
                                <span className="dot normal-stock"></span> Stock normal
                            </div>
                        </div>
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
                <button className="btn-alerts" onClick={() => setIsAlertModalOpen(true)}>
                    <Sun size={18} />
                    Ver Alertas de Stock
                    {alerts.length > 0 && <span className="alert-dot"></span>}
                </button>
            </div>

            <AlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                alerts={alerts}
                onRefresh={fetchData}
            />
        </DashboardLayout>
    );
};

export default PersonalDashboard;

