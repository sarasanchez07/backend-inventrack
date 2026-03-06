import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { X } from 'lucide-react';
import '../dashboard/Dashboards.css';
import './ReportsPage.css'; // Add the CSS import
import { reportService } from '../../services/reportService';


const ReportsPage = () => {
    const { inventoryId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [movementType, setMovementType] = useState('');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const title = isAdmin && inventoryId
        ? `Reporte del Inventario ${inventoryId}`
        : isAdmin
            ? 'Reporte General'
            : 'Tus Reportes';

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (movementType && movementType !== 'ALL') params.type = movementType;
            if (inventoryId) params.inventory_id = inventoryId;

            const data = await reportService.getMovements(params);
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [inventoryId]);

    const handleGenerateReport = () => {
        fetchReports();
    };

    const handleExportCSV = async () => {
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (movementType && movementType !== 'ALL') params.type = movementType;
            if (inventoryId) params.inventory_id = inventoryId;

            const blob = await reportService.exportMovementsCSV(params);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'reporte_inventario.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    const handleExportPDF = async () => {
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (movementType && movementType !== 'ALL') params.type = movementType;
            if (inventoryId) params.inventory_id = inventoryId;

            const blob = await reportService.exportMovementsPDF(params);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'reporte_inventario.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting PDF:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <DashboardLayout role={user?.role || 'personal'} isSpecificView={!!inventoryId} inventoryId={inventoryId}>
            <div className="reports-page">
                <div className="page-header justify-between">
                    <h2 className="page-title">{title}</h2>
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

                <div className="reports-filters-section">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label className="filter-label">Fecha Desde</label>
                            <div className="filter-input-wrapper">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Fecha Hasta</label>
                            <div className="filter-input-wrapper">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Filtrar por</label>
                            <div className="filter-input-wrapper">
                                <select
                                    value={movementType}
                                    onChange={(e) => setMovementType(e.target.value)}
                                >
                                    <option value="">Tipos de movimientos</option>
                                    <option value="ALL">Todos</option>
                                    <option value="IN">Entrada</option>
                                    <option value="OUT">Salida</option>
                                </select>
                            </div>
                        </div>
                        <button
                            className="btn-generate"
                            onClick={handleGenerateReport}
                        >
                            Generar reporte
                        </button>
                    </div>
                </div>

                <div className="reports-table-container">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Fecha</th>
                                <th>Movimiento</th>
                                <th>Cantidad</th>
                                <th>Stock</th>
                                <th>Motivo</th>
                                <th>Notas</th>
                                {isAdmin && <th>Personal</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="empty-state-row">
                                    <td colSpan={isAdmin ? 8 : 7}>Cargando reportes...</td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr className="empty-state-row">
                                    <td colSpan={isAdmin ? 8 : 7}>No hay movimientos registrados para los filtros seleccionados.</td>
                                </tr>
                            ) : (
                                reports.map((report, index) => (
                                    <tr key={index}>
                                        <td>{report.product_name}</td>
                                        <td>{formatDate(report.created_at)}</td>
                                        <td>{report.type === 'IN' ? 'Entrada' : 'Salida'}</td>
                                        <td>{report.display_quantity}</td>
                                        <td>{report.display_stock}</td>
                                        <td>{report.reason || 'N/A'}</td>
                                        <td>{report.notes || 'N/A'}</td>
                                        {isAdmin && <td>{report.user_full_name}</td>}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="export-actions">
                    <button
                        className="btn-export"
                        onClick={handleExportCSV}
                        disabled={reports.length === 0}
                    >
                        Exportar en CVS
                    </button>
                    <button
                        className="btn-export"
                        onClick={handleExportPDF}
                        disabled={reports.length === 0}
                    >
                        Exportar en PDF
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;

