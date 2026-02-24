import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import CreateInventoryModal from '../components/CreateInventoryModal';
import './Dashboards.css';
import { Plus, Sun, ArrowRight, X } from 'lucide-react';
import dashboardService from '../services/dashboardService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_products: 0,
        total_movements: 0,
        inventories: []
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleCreateInventory = async (formData) => {
        try {
            await dashboardService.createInventory(formData);
            setIsModalOpen(false);
            fetchStats(); // Refresh list
        } catch (error) {
            const message = error.response?.data?.detail || error.response?.data?.error || "Error al crear el inventario. Asegúrate de que el nombre sea único.";
            alert(message);
        }
    };

    const handleOpenInventory = (id) => {
        navigate(`/inventory/${id}`);
    };

    // Formatear fecha para mostrar (ej: 02/02/26)
    const formatDate = (dateString) => {
        if (!dateString) return '02/02/26'; // Placeholder like in image
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    return (
        <DashboardLayout role="admin">
            <div className="page-header">
                <h2 className="page-title">Inventario General</h2>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Cantidad Total de productos</span>
                        <span className="stat-value">{stats.total_products}</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: stats.total_products > 0 ? '100%' : '0%' }}></div>
                        <div className="progress-legend">
                            <span>Bajo stock</span>
                            <span>Buen estado</span>
                            <span>Stock bajo</span>
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

            <div className="inventory-section">
                <div className="section-header">
                    <h3 className="section-title">Tus Inventarios</h3>
                    <button className="btn-add-inventory" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Crear Inventario
                    </button>
                </div>

                <div className="inventory-list">
                    {stats.inventories.length > 0 ? (
                        stats.inventories.map(inv => (
                            <div key={inv.id} className="inventory-item-row">
                                <div className="inv-row-info">
                                    <div className="inv-row-header">
                                        <span className="inv-row-name">{inv.name}</span>
                                        <span className="inv-row-date">Creado el {formatDate(inv.created_at)}</span>
                                    </div>
                                    <p className="inv-row-desc">{inv.description || "Sin descripción"}</p>
                                </div>
                                <button className="btn-open-inventory" onClick={() => handleOpenInventory(inv.id)}>
                                    Abrir inventario <ArrowRight size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-inventory">
                            <div className="empty-illustration">
                                <div className="illustration-placeholder">👷‍♂️📦</div>
                            </div>
                            <p className="empty-text">No tienes Inventarios Registrados</p>
                        </div>
                    )}
                </div>
            </div>

            <button className="btn-alerts">
                <Sun size={18} />
                Ver Alertas de Stock
            </button>

            <CreateInventoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateInventory}
            />
        </DashboardLayout>
    );
};

export default AdminDashboard;
