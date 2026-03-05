import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import './ConfigPage.css';

const ConfigPage = () => {
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInv, setEditingInv] = useState(null);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingInv(null);
    };

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [units, setUnits] = useState([]);
    const [presentations, setPresentations] = useState([]);
    const [switches, setSwitches] = useState({
        has_concentration: false,
        has_presentation: false,
        has_quantity_per_presentation: false,
        has_expiration_date: false
    });

    const [newUnit, setNewUnit] = useState('');
    const [newPres, setNewPres] = useState('');

    const fetchInventories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/');
            setInventories(response.data);
        } catch (error) {
            console.error('Error fetching inventories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventories();
    }, []);

    const handleOpenEdit = async (inv) => {
        try {
            // Obtener el detalle completo con catálogos
            const response = await api.get(`/inventory/${inv.id}/`);
            const data = response.data;

            setEditingInv(inv);
            setName(data.name);
            setDescription(inv.description || '');

            // Catálogos
            setUnits(data.config.catalogos.unidades.map(u => u.name));
            setPresentations(data.config.catalogos.presentaciones.map(p => p.name));

            // Switches
            setSwitches({
                has_concentration: data.config.switches.concentracion,
                has_presentation: data.config.switches.presentacion,
                has_quantity_per_presentation: data.config.switches.cantidad_por_presentacion,
                has_expiration_date: data.config.switches.vencimiento
            });

            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading inventory detail', error);
        }
    };

    const handleAddUnit = () => {
        if (newUnit.trim() && !units.includes(newUnit.trim())) {
            setUnits([...units, newUnit.trim()]);
            setNewUnit('');
        }
    };

    const handleAddPres = () => {
        if (newPres.trim() && !presentations.includes(newPres.trim())) {
            setPresentations([...presentations, newPres.trim()]);
            setNewPres('');
        }
    };

    const handleRemoveTag = (list, setList, item) => {
        setList(list.filter(i => i !== item));
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este inventario? Todos los productos asociados se borrarán.')) {
            try {
                await api.delete(`/inventory/${id}/`);
                fetchInventories();
            } catch (error) {
                console.error('Error deleting inventory', error);
            }
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                name,
                description,
                switches,
                catalogos: {
                    unidades: units,
                    presentaciones: presentations
                }
            };

            await api.patch(`/inventory/${editingInv.id}/`, payload);
            setIsModalOpen(false);
            fetchInventories();
        } catch (error) {
            console.error('Error saving config', error);
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="config-page">
                <h2 className="config-title">Configuración De Inventarios</h2>

                <div className="inventory-grid">
                    {loading ? (
                        <p>Cargando inventarios...</p>
                    ) : inventories.map(inv => (
                        <div key={inv.id} className="inventory-card">
                            <h3>{inv.name}</h3>
                            <div className="card-actions">
                                <button className="btn-edit-inv" onClick={() => handleOpenEdit(inv)}>Editar</button>
                                <button className="btn-delete-inv" onClick={() => handleDelete(inv.id)}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="config-modal-overlay">
                    <div className="config-modal-card">
                        <div className="modal-header-with-close">
                            <h2 className="config-section-title">Edita informacion inventario</h2>
                            <button className="btn-close-modal" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="config-form-row">
                            <div className="config-form-group">
                                <label>Nombre</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del inventario" />
                            </div>
                            <div className="config-form-group">
                                <label>Descripcion</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el propósito de este inventario..." />
                            </div>
                        </div>

                        <h2 className="config-section-title">Edita el formulario de productos</h2>
                        <hr className="config-hr" />

                        <div className="config-form-group">
                            <label>Unidad Base</label>
                            <div className="catalog-input-group">
                                <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Agrega una unidad base que no este" />
                                <button className="btn-add-tag" onClick={handleAddUnit}>Agregar</button>
                            </div>
                            <div className="tags-container">
                                {units.map(u => (
                                    <div key={u} className="tag-item">
                                        {u} <span className="tag-remove" onClick={() => handleRemoveTag(units, setUnits, u)}>x</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="config-form-group">
                            <label>Presentación</label>
                            <div className="catalog-input-group">
                                <input value={newPres} onChange={(e) => setNewPres(e.target.value)} placeholder="Agrega una presentación que no este" />
                                <button className="btn-add-tag" onClick={handleAddPres}>Agregar</button>
                            </div>
                            <div className="tags-container">
                                {presentations.map(p => (
                                    <div key={p} className="tag-item">
                                        {p} <span className="tag-remove" onClick={() => handleRemoveTag(presentations, setPresentations, p)}>x</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="switches-container">
                            <div className="switch-item">
                                <input
                                    type="checkbox"
                                    className="switch-checkbox"
                                    checked={switches.has_concentration}
                                    onChange={(e) => setSwitches({ ...switches, has_concentration: e.target.checked })}
                                />
                                <label className="switch-label">Este inventario maneja productos con concentración (por ejemplo: 500 mg, 1000 mg). Activa esta opción solo si tus productos tienen diferentes concentraciones.</label>
                            </div>
                            <div className="switch-item">
                                <input
                                    type="checkbox"
                                    className="switch-checkbox"
                                    checked={switches.has_presentation}
                                    onChange={(e) => setSwitches({ ...switches, has_presentation: e.target.checked })}
                                />
                                <label className="switch-label">Activa esta opción si cada producto tiene una presentación que contiene una cantidad definida. Ejemplo: una tableta con 20 pastillas o una bolsa de 1000g.</label>
                            </div>
                            <div className="switch-item">
                                <input
                                    type="checkbox"
                                    className="switch-checkbox"
                                    checked={switches.has_expiration_date}
                                    onChange={(e) => setSwitches({ ...switches, has_expiration_date: e.target.checked })}
                                />
                                <label className="switch-label">Activa esta opción si necesitas controlar la fecha de vencimiento de tus productos.</label>
                            </div>
                        </div>

                        <button className="btn-save-config" onClick={handleSave}>Guardar</button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ConfigPage;
