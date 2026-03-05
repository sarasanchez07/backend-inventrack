import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, Sun, Check, Loader2 } from 'lucide-react';
import './AlertModal.css';
import productService from '../../services/productService';

const AlertModal = ({ isOpen, onClose, alerts, onRefresh }) => {
    const [correctingProduct, setCorrectingProduct] = useState(null);
    const [newExpirationDate, setNewExpirationDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleOpenCorrect = (alert) => {
        setCorrectingProduct(alert);
        // Sugerir la fecha actual + 1 año o dejar vacío
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setNewExpirationDate(nextYear.toISOString().split('T')[0]);
    };

    const handleSaveCorrection = async (e) => {
        e.preventDefault();
        if (!correctingProduct || !newExpirationDate) return;

        setIsSaving(true);
        try {
            await productService.updateProduct(correctingProduct.product_id, {
                expiration_date: newExpirationDate
            });
            // Al guardar, refrescamos alertas y cerramos sub-formulario
            if (onRefresh) await onRefresh();
            setCorrectingProduct(null);
        } catch (error) {
            console.error("Error al corregir fecha:", error);
            alert("Error al actualizar la fecha de vencimiento");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setCorrectingProduct(null);
        onClose();
    };

    return (
        <div className="alert-modal-overlay">
            <div className="alert-modal-card">
                <div className="alert-modal-header">
                    <h2 className="alert-modal-title">
                        {correctingProduct ? 'Corregir Vencimiento' : 'Centro de Alertas'}
                    </h2>
                    <button className="btn-close-modal" onClick={handleCloseModal}><X size={24} /></button>
                </div>

                <div className="alert-modal-content">
                    {correctingProduct ? (
                        <form className="correction-form" onSubmit={handleSaveCorrection}>
                            <div className="correction-info">
                                <span className="label">Producto:</span>
                                <span className="value">{correctingProduct.product_name}</span>
                            </div>

                            <div className="form-group">
                                <label>Nueva fecha de vencimiento *</label>
                                <input
                                    type="date"
                                    required
                                    className="modal-input"
                                    value={newExpirationDate}
                                    onChange={(e) => setNewExpirationDate(e.target.value)}
                                />
                            </div>

                            <div className="correction-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setCorrectingProduct(null)}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save-correction"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    Guardar
                                </button>
                            </div>
                        </form>
                    ) : alerts.length === 0 ? (
                        <div className="no-alerts-message">
                            <Sun size={48} color="#94a3b8" />
                            <p>No hay alertas en este momento</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="alerts-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Stock Actual</th>
                                        <th>Inventario</th>
                                        <th>Motivo</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map((alert, index) => (
                                        <tr key={index}>
                                            <td className="product-name-cell">{alert.product_name}</td>
                                            <td>{alert.current_stock}</td>
                                            <td>{alert.inventory}</td>
                                            <td className={`reason-cell ${alert.type === 'LOW_STOCK' ? 'low-stock' : 'expiration'}`}>
                                                {alert.type === 'LOW_STOCK' ? <AlertTriangle size={14} /> : <Calendar size={14} />}
                                                {alert.reason}
                                            </td>
                                            <td>
                                                {alert.type === 'EXPIRATION' && (
                                                    <button
                                                        className="btn-correct"
                                                        onClick={() => handleOpenCorrect(alert)}
                                                    >
                                                        Corregir
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertModal;

