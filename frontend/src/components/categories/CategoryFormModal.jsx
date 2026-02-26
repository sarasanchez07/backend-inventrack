import React, { useState, useEffect } from 'react';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, category, inventories, userRole }) => {
    const [name, setName] = useState('');
    const [inventoryId, setInventoryId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setInventoryId(category.inventory || '');
        } else {
            setName('');
            setInventoryId(inventories.length === 1 ? inventories[0].id : '');
        }
        setError('');
    }, [category, isOpen, inventories]);

    if (!isOpen) return null;

    const isEditing = !!category;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('El nombre es obligatorio.');
            return;
        }
        if (!isEditing && !inventoryId) {
            setError('Debes seleccionar un inventario.');
            return;
        }

        const data = { name: name.trim() };
        if (!isEditing) {
            data.inventory = inventoryId;
        }

        onSubmit(data);
    };

    // Determinar el título del inventario para el modal
    const getInventoryTitle = () => {
        if (isEditing && category) {
            return category.inventory_name || 'Inventario';
        }
        if (inventories.length === 1) {
            return inventories[0].name;
        }
        return '';
    };

    const inventoryTitle = getInventoryTitle();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="category-modal-card" onClick={(e) => e.stopPropagation()}>
                <h2 className="category-modal-title">
                    {isEditing
                        ? `Editar categoría`
                        : `Agrega categoría${inventoryTitle ? ` a ${inventoryTitle}` : ''}`}
                </h2>

                {error && <div className="category-modal-error">{error}</div>}

                <form onSubmit={handleSubmit} className="category-modal-form">
                    {/* Selector de inventario (solo al crear y si hay más de 1) */}
                    {!isEditing && inventories.length > 1 && (
                        <div className="category-input-group">
                            <label>Inventario</label>
                            <select
                                value={inventoryId}
                                onChange={(e) => setInventoryId(e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Selecciona un inventario
                                </option>
                                {inventories.map((inv) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="category-input-group">
                        <label>Nombre de la categoría</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Eje: Antiiflamatorio"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-category-submit">
                        {isEditing ? 'Guardar Cambios' : 'Registrar Categoría'}
                    </button>
                    <button type="button" className="btn-category-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
