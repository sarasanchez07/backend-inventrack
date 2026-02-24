import React, { useState } from 'react';
import { X, Tag, AlignLeft, List } from 'lucide-react';

const CreateInventoryModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        selected_option: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-icon-container">
                    <div className="modal-store-icon">🏪</div>
                </div>

                <h2 className="modal-title">Crea Tu Inventario</h2>
                <p className="modal-subtitle">Define un espacio para tus productos especifico</p>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-input-group">
                        <label>Nombre del inventario</label>
                        <div className="input-with-icon">
                            <Tag size={18} className="field-icon" />
                            <input
                                name="name"
                                placeholder="Medicamentos, Alimentos, Objetos"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-input-group">
                        <label>Descripcion</label>
                        <div className="input-with-icon items-start">
                            <AlignLeft size={18} className="field-icon mt-2" />
                            <textarea
                                name="description"
                                placeholder="En este inventario se llevara el registro de todos los insumos...."
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="modal-input-group">
                        <label>Unidades para tu inventario</label>
                        <div className="input-with-icon">
                            <List size={18} className="field-icon" />
                            <select
                                name="selected_option"
                                value={formData.selected_option}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Unidades</option>
                                <option value="1">Medicamentos (Mg, Ml, g, Pastilla)</option>
                                <option value="2">Alimentos (Kg, Lb, unidad)</option>
                                <option value="3">Objetos (Unidades exactas)</option>
                                <option value="4">Personalizado</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-modal-submit">Crear Inventario</button>
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
                </form>
            </div>
        </div>
    );
};

export default CreateInventoryModal;
