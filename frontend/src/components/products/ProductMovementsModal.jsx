import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Info, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import productService from '../../services/productService';
import { reportService } from '../../services/reportService';

const ProductMovementsModal = ({ isOpen, onClose, product }) => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [movementType, setMovementType] = useState('');

    useEffect(() => {
        if (isOpen && product) {
            fetchMovements();
        }
    }, [isOpen, product]);

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const params = {};
            if (movementType && movementType !== 'ALL' && movementType !== '') {
                params.type = movementType;
            }
            const data = await productService.getProductMovements(product.id, params);
            setMovements(data);
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        fetchMovements();
    };

    const handleExportCSV = async () => {
        try {
            const params = { product_id: product.id };
            if (movementType && movementType !== 'ALL') params.type = movementType;

            const blob = await reportService.exportMovementsCSV(params);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `movimientos_${product.name}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    const handleExportPDF = async () => {
        try {
            const params = { product_id: product.id };
            if (movementType && movementType !== 'ALL') params.type = movementType;

            const blob = await reportService.exportMovementsPDF(params);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `movimientos_${product.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting PDF:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="movements-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="movements-modal-header">
                    <div className="header-left">
                        <h2 className="movements-modal-title">Movimientos de {product.display_name || product.name}</h2>
                        <span className="stock-info">Stock Actual: <strong>{product.current_stock}</strong> {product.unit_name}</span>
                    </div>
                    <button className="close-x" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="filters-container-modal">
                    <div className="modal-filter-group">
                        <select
                            className="modal-filter-select"
                            value={movementType}
                            onChange={(e) => setMovementType(e.target.value)}
                        >
                            <option value="ALL">Tipo de movimiento</option>
                            <option value="IN">Entrada</option>
                            <option value="OUT">Salida</option>
                            <option value="CANCELLED">Anulado</option>
                        </select>
                        <button className="btn-modal-filter" onClick={handleFilter}>
                            <Filter size={16} />
                            Filtrar
                        </button>
                    </div>
                </div>

                <div className="movements-modal-body">
                    {loading ? (
                        <div className="loading-state">Cargando movimientos...</div>
                    ) : movements.length > 0 ? (
                        <div className="table-responsive">
                            <table className="movements-table">
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Cantidad</th>
                                        <th>Unidad</th>
                                        <th>Fecha</th>
                                        <th>Responsable</th>
                                        <th>Motivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((mov) => (
                                        <tr key={mov.id} className={mov.is_cancelled ? 'row-cancelled' : (mov.type === 'IN' ? 'row-in' : 'row-out')}>
                                            <td className="col-type">
                                                {mov.is_cancelled ? (
                                                    <span className="badge badge-cancelled">Anulado</span>
                                                ) : mov.type === 'IN' ? (
                                                    <span className="badge badge-in">Entrada</span>
                                                ) : (
                                                    <span className="badge badge-out">Salida</span>
                                                )}
                                            </td>
                                            <td className="col-qty">{mov.quantity}</td>
                                            <td className="col-unit">{mov.unit_name_at_time || mov.unit_name}</td>
                                            <td className="col-date">{new Date(mov.created_at).toLocaleDateString()}</td>
                                            <td className="col-user">{mov.user_full_name || mov.user_name}</td>
                                            <td className="col-reason">
                                                <div className="reason-text" title={mov.reason}>
                                                    {mov.reason || 'Sin motivo'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="empty-state">
                                <Info size={48} color="#94a3b8" />
                                <p>No hay movimientos registrados para este producto o filtro.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer-actions">
                    <button className="btn-modal-export csv" onClick={handleExportCSV} disabled={movements.length === 0}>
                        <FileSpreadsheet size={18} />
                        Exportar CSV
                    </button>
                    <button className="btn-modal-export pdf" onClick={handleExportPDF} disabled={movements.length === 0}>
                        <FileText size={18} />
                        Exportar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductMovementsModal;

