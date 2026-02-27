import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { X, Search, RotateCcw, Calendar, Users, Package, ArrowRightLeft, Hash, Edit, Ban } from 'lucide-react';
import productService from '../../services/productService';
import movementService from '../../services/movementService';
import './MovementsPage.css';

const MovementsPage = () => {
    const { inventoryId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    // ─── Reference Data ───
    const [products, setProducts] = useState([]);

    // ─── Form State ───
    const [formData, setFormData] = useState({
        product: '',
        type: '',
        quantity: '',
        unit_type: 'BASE',
        reason: '',
        notes: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── Feedback State (45s Timer) ───
    const [recentMovement, setRecentMovement] = useState(null);
    const timerRef = useRef(null);

    // ─── Admin Table State ───
    const [movements, setMovements] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [filterType, setFilterType] = useState('');
    const [loadingTable, setLoadingTable] = useState(false);

    // ─── Fetch Products ───
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const params = inventoryId ? { inventory_id: inventoryId } : {};
                const data = await productService.getProducts(params);
                setProducts(data);
            } catch (err) {
                console.error("Error cargando productos:", err);
            }
        };
        loadProducts();
    }, [inventoryId]);

    // ─── Fetch Movements (Admin & Personal History if needed, but mainly Admin) ───
    const loadMovements = useCallback(async () => {
        if (!isAdmin) return; // Personal can only see the 45s table, Admin sees all
        setLoadingTable(true);
        try {
            const params = {};
            if (inventoryId) params.inventory_id = inventoryId;
            if (searchUser.trim()) params.search_user = searchUser.trim();
            if (filterType) params.type = filterType;

            const data = await movementService.getMovements(params);
            setMovements(data);
        } catch (err) {
            console.error("Error cargando movimientos:", err);
        } finally {
            setLoadingTable(false);
        }
    }, [isAdmin, inventoryId, searchUser, filterType]);

    useEffect(() => {
        if (isAdmin) {
            loadMovements();
        }
    }, [loadMovements, isAdmin]);

    // ─── Form Handling ───
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.product || !formData.type || !formData.quantity || !formData.reason) {
            setFormError('Por favor completa todos los campos requeridos (Producto, Tipo, Cantidad, Motivo).');
            return;
        }

        setIsSubmitting(true);
        try {
            let savedMovement;
            if (isEditing) {
                savedMovement = await movementService.updateMovement(editingId, formData);
                if (isAdmin) loadMovements();
            } else {
                savedMovement = await movementService.createMovement(formData);
                if (isAdmin) loadMovements();
            }

            // Show feedback for 45s
            setRecentMovement(savedMovement);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setRecentMovement(null);
            }, 45000); // 45 seconds

            // Reset form
            setFormData({
                product: '',
                type: '',
                quantity: '',
                unit_type: 'BASE',
                reason: '',
                notes: ''
            });
            setIsEditing(false);
            setEditingId(null);

        } catch (error) {
            setFormError(
                error.response?.data?.error ||
                error.response?.data?.quantity?.[0] ||
                'Error al procesar el movimiento. Verifica el stock.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            product: '',
            type: '',
            quantity: '',
            unit_type: 'BASE',
            reason: '',
            notes: ''
        });
        setIsEditing(false);
        setEditingId(null);
        setFormError('');
    };

    // ─── Admin Actions ───
    const handleEditMovement = (mov) => {
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setIsEditing(true);
        setEditingId(mov.id);
        setFormData({
            product: mov.product || '',
            type: mov.type,
            quantity: mov.quantity,
            unit_type: mov.unit_type || 'BASE',
            reason: mov.reason || '',
            notes: mov.notes || ''
        });
        setFormError('');
    };

    const handleCancelMovementAction = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas anular este movimiento? Esta acción revertirá el stock.")) return;
        try {
            await movementService.cancelMovement(id);
            loadMovements();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al anular movimiento.');
        }
    };

    // Helper formatting
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getDisplayStock = (prod) => {
        if (prod.quantity_per_presentation && prod.quantity_per_presentation > 0) {
            const presentations = Math.floor(prod.current_stock / prod.quantity_per_presentation);
            return `${presentations} ${prod.presentation_name || 'unidades'}`;
        }
        return `${prod.current_stock} ${prod.presentation_name || prod.unit_name || 'unidades'}`;
    };

    const todayDateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <DashboardLayout role={user?.role || 'personal'} isSpecificView={!!inventoryId} inventoryId={inventoryId}>
            <div className="movements-page">
                {/* ─── Header for Form ─── */}
                {(!isAdmin || isEditing || !!inventoryId) && (
                    <div className="movements-header">
                        <div className="movements-header-left">
                            <h1 className="movements-title">
                                {isEditing ? 'Editar movimiento' : 'Registrar movimiento'}
                            </h1>
                        </div>
                        {isAdmin && inventoryId && (
                            <div className="movements-header-right">
                                <button
                                    type="button"
                                    className="category-close-btn"
                                    onClick={() => navigate('/admin')}
                                    title="Volver al Inventario General"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Form Section ─── */}
                {(!isAdmin || isEditing || !!inventoryId) && (
                    <div className="movement-form-card">
                        {formError && <div className="movement-form-error">{formError}</div>}

                        <form className="movement-form" onSubmit={handleFormSubmit}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Nombre del producto *</label>
                                    <select
                                        name="product"
                                        value={formData.product}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="" disabled>Seleccione un producto...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.concentration ? `(${p.concentration})` : ''} - {getDisplayStock(p)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group flex-1">
                                    <label>Fecha</label>
                                    <div className="date-input-wrapper">
                                        <input
                                            type="text"
                                            value={todayDateStr}
                                            disabled
                                        />
                                        <Calendar className="date-icon" size={18} />
                                    </div>
                                </div>

                                <div className="form-group flex-1">
                                    <label>Tipo de movimiento *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isEditing}
                                    >
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="IN">Entrada</option>
                                        <option value="OUT">Salida</option>
                                    </select>
                                </div>

                                <div className="form-group flex-1">
                                    <label>Cantidad *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 1"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                {isAdmin && (
                                    <div className="form-group w-third">
                                        <label>Unidad *</label>
                                        <select
                                            name="unit_type"
                                            value={formData.unit_type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="BASE">Unidad base</option>
                                            <option value="PRESENTATION">Presentación</option>
                                        </select>
                                    </div>
                                )}

                                <div className="form-group flex-1">
                                    <label>Motivo *</label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        placeholder="Motivo de tu movimiento..."
                                        required
                                        rows={2}
                                    />
                                </div>

                                {isAdmin && (
                                    <div className="form-group flex-1">
                                        <label>Notas</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Notas adicionales..."
                                            rows={2}
                                        />
                                    </div>
                                )}

                                <div className="form-group form-actions">
                                    {isEditing && (
                                        <button type="button" className="btn-form-cancel" onClick={handleCancelEdit}>
                                            Cancelar
                                        </button>
                                    )}
                                    <button type="submit" className="btn-form-save" disabled={isSubmitting}>
                                        {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── Feedback Table (45s) ─── */}
                {((!isAdmin || !!inventoryId) && recentMovement) && (
                    <div className="recent-movement-section">
                        <div className="recent-movement-table-container">
                            <table className="recent-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Fecha</th>
                                        <th>Movimiento</th>
                                        <th>Cantidad</th>
                                        <th>Motivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="success-row">
                                        <td><strong>{recentMovement.product_name}</strong></td>
                                        <td>{formatDate(recentMovement.created_at)}</td>
                                        <td>
                                            <span className={`badge-type ${recentMovement.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                                                {recentMovement.type === 'IN' ? 'Entrada' : 'Salida'}
                                            </span>
                                        </td>
                                        <td>{recentMovement.quantity} <span className="text-gray-500 text-xs">({recentMovement.unit_name})</span></td>
                                        <td>{recentMovement.reason}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── Admin Section: All Movements ─── */}
                {(isAdmin && !isEditing && !inventoryId) && (
                    <div className="admin-movements-section">
                        <h2 className="section-title">Movimientos de tu personal</h2>

                        <div className="admin-search-row">
                            <div className="search-input-wrapper">
                                <label>Buscar Personal</label>
                                <div className="input-with-icon">
                                    <Users className="field-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Nombre o correo..."
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && loadMovements()}
                                    />
                                </div>
                            </div>
                            <div className="search-input-wrapper">
                                <label>Tipo de movimientos</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        // Auto trigger search internally for select changes if preferred, else wait for button
                                    }}
                                >
                                    <option value="">Todos los movimientos</option>
                                    <option value="IN">Entradas</option>
                                    <option value="OUT">Salidas</option>
                                </select>
                            </div>
                            <div className="search-action-btns">
                                <button className="btn-search-admin" onClick={loadMovements}>Buscar</button>
                                <button className="btn-clear-admin" onClick={() => {
                                    setSearchUser('');
                                    setFilterType('');
                                    setTimeout(loadMovements, 0);
                                }}>Limpiar</button>
                            </div>
                        </div>

                        <div className="admin-table-container">
                            {loadingTable ? (
                                <div className="table-status">Cargando movimientos...</div>
                            ) : movements.length > 0 ? (
                                <table className="admin-movements-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Personal</th>
                                            <th>Producto</th>
                                            <th>Movimiento</th>
                                            <th>Cantidad</th>
                                            <th>Estado</th>
                                            <th>Motivo</th>
                                            <th>Notas</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movements.map(mov => (
                                            <tr key={mov.id} className={mov.status === 'Anulado' ? 'row-cancelled' : ''}>
                                                <td>{formatDate(mov.created_at)}</td>
                                                <td>
                                                    <div className="personal-info">
                                                        <span>{mov.user_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong>{mov.product_name}</strong>
                                                </td>
                                                <td>
                                                    <span className={`badge-type ${mov.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                                                        {mov.type === 'IN' ? 'Entrada' : 'Salida'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {mov.quantity}
                                                    <div className="text-xs text-gray-500 mt-1">{mov.unit_name}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge-status ${mov.status === 'Anulado' ? 'status-red' : mov.is_edited ? 'status-orange' : 'status-green'}`}>
                                                        {mov.status === 'Anulado' ? 'Anulado' : mov.is_edited ? 'Editado' : 'Activo'}
                                                    </span>
                                                </td>
                                                <td><div className="truncate-text" title={mov.reason}>{mov.reason}</div></td>
                                                <td><div className="truncate-text" title={mov.notes}>{mov.notes || 'N/A'}</div></td>
                                                <td>
                                                    <div className="admin-row-actions">
                                                        {mov.status !== 'Anulado' && (
                                                            <>
                                                                <button className="btn-row-edit" onClick={() => handleEditMovement(mov)} title="Editar">
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button className="btn-row-cancel" onClick={() => handleCancelMovementAction(mov.id)} title="Anular">
                                                                    <Ban size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state-admin">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486774.png" alt="No records" className="empty-icon" />
                                    <p>No tiene registros</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MovementsPage;
