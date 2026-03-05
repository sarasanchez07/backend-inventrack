import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { staffService } from '../../services/staffService';
import api from '../../services/api';
import './StaffPage.css';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [assignedInventories, setAssignedInventories] = useState([]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await staffService.getAllStaff();
            setStaff(data);
        } catch (error) {
            console.error('Error fetching staff', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventories = async () => {
        try {
            const response = await api.get('/inventory/');
            setInventories(response.data);
        } catch (error) {
            console.error('Error fetching inventories', error);
        }
    };

    useEffect(() => {
        fetchStaff();
        fetchInventories();
    }, []);

    const handleOpenModal = (person = null) => {
        if (person) {
            setEditingStaffId(person.id);
            setFullName(person.first_name || '');
            setEmail(person.email || '');
            setPassword('');
            setRole(person.role || '');
            setAssignedInventories(person.assigned_inventories || []);
        } else {
            setEditingStaffId(null);
            setFullName('');
            setEmail('');
            setPassword('');
            setRole('');
            setAssignedInventories([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaffId(null);
    };

    const handleInventoryToggle = (id) => {
        setAssignedInventories(prev =>
            prev.includes(id)
                ? prev.filter(invId => invId !== id)
                : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                first_name: fullName,
                email,
                role,
                assigned_inventories: assignedInventories
            };

            if (password) {
                payload.password = password;
            }

            if (editingStaffId) {
                await staffService.updateStaff(editingStaffId, payload);
            } else {
                await staffService.createStaff(payload);
            }

            handleCloseModal();
            fetchStaff();
        } catch (error) {
            console.error('Error saving staff', error);
            alert('Asegúrate de haber ingresado una contraseña y que el correo no esté duplicado.');
        }
    };

    const filteredStaff = staff.filter(person =>
        (person.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="admin">
            <div className="staff-page">
                <div className="staff-header-section">
                    <h2 className="staff-title">Tu Personal</h2>
                </div>

                <div className="staff-summary-card">
                    <div className="staff-card-content">
                        <h3>Registra a tu personal</h3>
                        <p>Asigna credenciales a uno o varios miembros de tu equipo para que accedan únicamente al inventario que necesitan.</p>
                    </div>
                    <button className="btn-create-staff" onClick={() => handleOpenModal()}>
                        <span>+</span> Crear Personal
                    </button>
                </div>

                <div className="staff-search-section">
                    <h4>Buscar Personal</h4>
                    <div className="search-controls">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Busca a tu personal por su nombre o correo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn-search-staff">Buscar</button>
                        <button className="btn-clear-staff" onClick={() => setSearchQuery('')}>Limpiar</button>
                    </div>
                </div>

                <div className="staff-table-container">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>Cargando personal...</td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No se encontro personal registrado.</td>
                                </tr>
                            ) : (
                                filteredStaff.map(person => (
                                    <tr key={person.id}>
                                        <td>{person.first_name || 'N/A'}</td>
                                        <td>{person.email}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{person.role}</td>
                                        <td>
                                            <button
                                                className="btn-edit-staff"
                                                onClick={() => handleOpenModal(person)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="staff-modal-overlay">
                    <div className="staff-modal-card">
                        <div className="modal-header-with-close">
                            <h2 className="staff-modal-title">
                                {editingStaffId ? 'Editar Personal' : 'Agregar Nuevo Personal'}
                            </h2>
                            <button className="btn-close-modal" onClick={handleCloseModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="staff-form-group">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    placeholder="Eje: Juan Perez"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="staff-form-group">
                                <label>Correo Electrónico</label>
                                <input
                                    type="email"
                                    placeholder="juanperez@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="staff-form-group">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="*********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!editingStaffId} // Solo obligatoria al crear, opcional al editar
                                />
                                {editingStaffId && <small style={{ color: '#94a3b8', marginTop: '4px' }}>Déjalo en blanco para no cambiarla.</small>}
                            </div>

                            <div className="staff-form-group">
                                <label>Rol</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Selecciona un Rol</option>
                                    <option value="estudiante">Estudiante</option>
                                    <option value="maestro">Maestro</option>
                                    <option value="jefe">Jefe</option>
                                    <option value="personal">Personal</option>
                                </select>
                            </div>

                            <div className="staff-form-group">
                                <label>Asignar Inventarios</label>
                                <div className="inventory-checkboxes">
                                    {inventories.map(inv => (
                                        <label key={inv.id} className="inventory-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={assignedInventories.includes(inv.id)}
                                                onChange={() => handleInventoryToggle(inv.id)}
                                            />
                                            {inv.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-staff">
                                {editingStaffId ? 'Guardar Cambios' : 'Registrar Personal'}
                            </button>
                            <button type="button" className="btn-cancel-staff" onClick={handleCloseModal}>
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default StaffPage;
