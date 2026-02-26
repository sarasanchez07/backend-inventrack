import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Layers, Database, Activity, ClipboardList, Calendar, Hash } from 'lucide-react';

const ProductFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    product,
    categories = [],
    units = [],
    presentations = [],
    config = {}
}) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        category: '',
        base_unit: '',
        presentation: '',
        concentration: '',
        quantity_per_presentation: 1,
        stock_min_presentations: 0,
        stock_initial_presentations: 0,
        expiration_date: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                code: product.code || '',
                category: product.category || '',
                base_unit: product.base_unit || '',
                presentation: product.presentation || '',
                concentration: product.concentration || '',
                quantity_per_presentation: product.quantity_per_presentation || 1,
                stock_min_presentations: product.stock_min_presentations || 0,
                stock_initial_presentations: product.stock_initial_presentations || 0,
                expiration_date: product.expiration_date || ''
            });
        } else {
            setFormData({
                name: '',
                code: '',
                category: '',
                base_unit: '',
                presentation: '',
                concentration: '',
                quantity_per_presentation: 1,
                stock_min_presentations: 0,
                stock_initial_presentations: 0,
                expiration_date: ''
            });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.category) {
            setError('Nombre y categoría son obligatorios.');
            return;
        }

        onSubmit(formData);
    };

    const switches = config.switches || {};

    // Resumen dinámico
    const getSummary = () => {
        const catName = categories.find(c => c.id.toString() === formData.category.toString())?.name || 'Categoría';
        const unitName = units.find(u => u.id.toString() === formData.base_unit.toString())?.name || 'unidad';
        const presName = presentations.find(p => p.id.toString() === formData.presentation.toString())?.name || 'presentación';

        const totalUnits = Number(formData.stock_initial_presentations) * Number(formData.quantity_per_presentation);

        let summary = `${formData.name || 'Producto'} ${formData.concentration ? formData.concentration : ''}, ${catName}, ${presName}, ${unitName}`;
        if (switches.vencimiento) summary += `, fecha: ${formData.expiration_date || '00/00/0000'}`;
        summary += `, cantidad por presentacion: ${formData.quantity_per_presentation}`;
        summary += `, stock actual: ${formData.stock_initial_presentations} (${formData.stock_initial_presentations} ${presName} * ${formData.quantity_per_presentation}${unitName} = ${totalUnits}${unitName}).`;

        return summary;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="product-modal-header">
                    <h2 className="product-modal-title">{product ? 'Editar Producto' : 'Registrar Producto'}</h2>
                    <button className="close-x" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="product-modal-form">
                    {error && <div className="error-banner">{error}</div>}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombre del producto</label>
                            <div className="input-icon-wrapper no-icon">
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Eje: Ibuprofeno, Arroz..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Selecciona la categoria</label>
                            <div className="input-icon-wrapper no-icon">
                                <select name="category" value={formData.category} onChange={handleChange} required>
                                    <option value="" disabled>Categoria</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Unidad base</label>
                            <div className="input-icon-wrapper no-icon">
                                <select name="base_unit" value={formData.base_unit} onChange={handleChange}>
                                    <option value="" disabled>Unidad base</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {switches.presentacion && (
                            <div className="form-group">
                                <label>Selecciona la presentación</label>
                                <div className="input-icon-wrapper no-icon">
                                    <select name="presentation" value={formData.presentation} onChange={handleChange}>
                                        <option value="" disabled>Presentacion</option>
                                        {presentations.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {switches.concentracion && (
                            <div className="form-group">
                                <label>Concentración</label>
                                <div className="input-icon-wrapper no-icon">
                                    <input
                                        name="concentration"
                                        value={formData.concentration}
                                        onChange={handleChange}
                                        placeholder="Eje: 500mg"
                                    />
                                </div>
                            </div>
                        )}

                        {switches.cantidad_por_presentacion && (
                            <div className="form-group">
                                <label>Cantidad por presentacion</label>
                                <div className="input-icon-wrapper no-icon">
                                    <input
                                        type="number"
                                        name="quantity_per_presentation"
                                        value={formData.quantity_per_presentation}
                                        onChange={handleChange}
                                        placeholder="Ej: 20"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Stock Minimo </label>
                            <div className="input-icon-wrapper no-icon">
                                <input
                                    type="number"
                                    name="stock_min_presentations"
                                    value={formData.stock_min_presentations}
                                    onChange={handleChange}
                                    placeholder="Ej: 10"
                                />
                            </div>
                        </div>

                        {!product && (
                            <div className="form-group">
                                <label>Stock Inicial</label>
                                <div className="input-icon-wrapper no-icon">
                                    <input
                                        type="number"
                                        name="stock_initial_presentations"
                                        value={formData.stock_initial_presentations}
                                        onChange={handleChange}
                                        placeholder="Ej: 10"
                                    />
                                </div>
                            </div>
                        )}

                        {switches.vencimiento && (
                            <div className="form-group">
                                <label>Fecha de Vencimiento</label>
                                <div className="input-icon-wrapper no-icon">
                                    <input
                                        type="date"
                                        name="expiration_date"
                                        value={formData.expiration_date}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Codigo</label>
                            <div className="input-icon-wrapper no-icon">
                                <input
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="20001"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="summary-box">
                        <label>Resumen</label>
                        <div className="summary-content">
                            {getSummary()}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-submit">
                            {product ? 'Guardar Cambios' : 'Registrar Producto'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
