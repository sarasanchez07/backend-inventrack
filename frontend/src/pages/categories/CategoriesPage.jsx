import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import CategoryFormModal from '../../components/categories/CategoryFormModal';
import CategoryProductsModal from '../../components/categories/CategoryProductsModal';
import categoryService from '../../services/categoryService';
import { Plus, X } from 'lucide-react';
import './CategoriesPage.css';

const CategoriesPage = () => {
    const { inventoryId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // Data
    const [categories, setCategories] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterInventoryId, setFilterInventoryId] = useState(inventoryId || '');

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [viewProductsCategory, setViewProductsCategory] = useState(null);

    // ─── Load inventories (for filter & form) ───
    useEffect(() => {
        const loadInventories = async () => {
            try {
                const data = await categoryService.getInventories();
                setInventories(data);
            } catch (err) {
                console.error('Error cargando inventarios:', err);
            }
        };
        loadInventories();
    }, []);

    // ─── Fetch categories ───
    const fetchCategories = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            // Si hay inventoryId en la URL, forzamos ese filtro
            const finalParams = { ...params };
            if (inventoryId) {
                finalParams.inventory_id = inventoryId;
            } else if (filterInventoryId) {
                finalParams.inventory_id = filterInventoryId;
            }

            const data = await categoryService.getCategories(finalParams);
            setCategories(data);
        } catch (err) {
            console.error('Error cargando categorías:', err);
        } finally {
            setLoading(false);
        }
    }, [inventoryId, filterInventoryId]);

    // Load on mount and when inventoryId changes
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories, inventoryId]);

    // Constant for the title of the current inventory if we are in a specific view
    const currentInventoryName = inventoryId && inventories.length > 0
        ? inventories.find(inv => inv.id.toString() === inventoryId)?.name
        : '';

    // ─── Handlers ───
    const handleSearch = () => {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        fetchCategories(params);
    };

    const handleClear = () => {
        setSearchTerm('');
        if (!inventoryId) {
            setFilterInventoryId('');
        }
        fetchCategories();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // Create / Edit
    const handleOpenCreate = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (cat) => {
        setEditingCategory(cat);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.id, data);
            } else {
                // Si estamos en un inventario específico, lo asignamos automáticamente
                const finalData = { ...data };
                if (inventoryId) {
                    finalData.inventory = inventoryId;
                }
                await categoryService.createCategory(finalData);
            }
            setIsFormOpen(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            const msg =
                err.response?.data?.name?.[0] ||
                err.response?.data?.error ||
                err.response?.data?.detail ||
                'Error al guardar la categoría.';
            alert(msg);
        }
    };

    // Delete
    const handleDelete = async (cat) => {
        const confirmed = window.confirm(
            `¿Estás seguro de eliminar la categoría "${cat.name}"?`
        );
        if (!confirmed) return;

        try {
            await categoryService.deleteCategory(cat.id);
            fetchCategories();
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                'Error al eliminar la categoría.';
            alert(msg);
        }
    };

    // View products
    const handleViewProducts = (cat) => {
        setViewProductsCategory(cat);
    };

    return (
        <DashboardLayout role={user?.role || 'personal'} isSpecificView={!!inventoryId} inventoryId={inventoryId}>
            <div className="categories-page">
                {/* Header */}
                <div className="categories-header">
                    <div className="categories-header-left">
                        <h1 className="categories-title">
                            {inventoryId ? `Categorías de ${currentInventoryName || 'Cargando...'}` : 'Tus categorías'}
                        </h1>
                        {!isAdmin && (
                            <div className="categories-subtitle">
                                <strong>Registra a tus categorías</strong>
                                <span>Aquí puedes registrar tus categorías de la mejor manera</span>
                            </div>
                        )}
                    </div>

                    <div className="categories-header-right">
                        {/* Botón de registro: Se muestra para todos ahora para permitir flexibilidad al Admin */}
                        <button
                            className="btn-register-category"
                            onClick={handleOpenCreate}
                        >
                            <Plus size={16} />
                            Registrar categoría
                        </button>

                        {/* Botón de cerrar (X) para el Admin cuando está en un inventario específico */}
                        {isAdmin && inventoryId && (
                            <button
                                type="button"
                                className="category-close-btn"
                                onClick={() => navigate('/admin')}
                                title="Volver al Inventario General"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search & filter section */}
                <div className="categories-search-section">
                    <h3 className="search-label">Buscar categorías</h3>
                    <div className="search-row">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Busca un categoría por su nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        {/* Filtro por inventario - solo se muestra si NO estamos en una vista específica */}
                        {!inventoryId && (
                            <select
                                className="search-inventory-filter"
                                value={filterInventoryId}
                                onChange={(e) => setFilterInventoryId(e.target.value)}
                            >
                                <option value="">Todos los inventarios</option>
                                {inventories.map((inv) => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button className="btn-search" onClick={handleSearch}>
                            Buscar
                        </button>
                        <button className="btn-clear" onClick={handleClear}>
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Categories table */}
                <div className="categories-table-section">
                    {loading ? (
                        <p className="categories-loading">Cargando categorías...</p>
                    ) : categories.length > 0 ? (
                        <table className="categories-table">
                            <thead>
                                <tr>
                                    <th>Categoría</th>
                                    <th>Inventario</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>{cat.name}</td>
                                        <td>{cat.inventory_name}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action btn-edit"
                                                    onClick={() => handleOpenEdit(cat)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn-action btn-delete"
                                                    onClick={() => handleDelete(cat)}
                                                >
                                                    Eliminar
                                                </button>
                                                {/* Ambos: Ver más */}
                                                <button
                                                    className="btn-action btn-view"
                                                    onClick={() => handleViewProducts(cat)}
                                                >
                                                    Ver más
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="categories-empty">
                            <p>No se encontraron categorías.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CategoryFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingCategory(null);
                }}
                onSubmit={handleFormSubmit}
                category={editingCategory}
                inventories={inventoryId ? inventories.filter(inv => inv.id.toString() === inventoryId) : inventories}
                userRole={user?.role}
            />

            <CategoryProductsModal
                isOpen={!!viewProductsCategory}
                onClose={() => setViewProductsCategory(null)}
                category={viewProductsCategory}
            />
        </DashboardLayout>
    );
};

export default CategoriesPage;
