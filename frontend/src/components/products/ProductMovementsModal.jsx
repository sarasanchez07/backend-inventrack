import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Info } from 'lucide-react';
import productService from '../../services/productService';

const ProductMovementsModal = ({ isOpen, onClose, product }) => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            fetchMovements();
        }
    }, [isOpen, product]);

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const data = await productService.getProductMovements(product.id);
            setMovements(data);
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setLoading(false);
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
                                        <tr key={mov.id} className={mov.type === 'IN' ? 'row-in' : 'row-out'}>
                                            <td className="col-type">
                                                {mov.type === 'IN' ? (
                                                    <span className="badge badge-in">Entrada</span>
                                                ) : (
                                                    <span className="badge badge-out">Salida</span>
                                                )}
                                            </td>
                                            <td className="col-qty">{mov.quantity}</td>
                                            <td className="col-unit">{mov.unit_name}</td>
                                            <td className="col-date">{new Date(mov.created_at).toLocaleDateString()}</td>
                                            <td className="col-user">{mov.user_name}</td>
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
                                <p>No hay movimientos registrados para este producto.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductMovementsModal;
