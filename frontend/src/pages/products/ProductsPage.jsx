import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import ProductFormModal from '../../components/products/ProductFormModal';
import ProductMovementsModal from '../../components/products/ProductMovementsModal';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import dashboardService from '../../services/dashboardService';
import { Plus, X, Search, RotateCcw, Layers } from 'lucide-react';
import './ProductsPage.css';

const ProductsPage = () => {
    const { inventoryId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    // Data
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [presentations, setPresentations] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [currentInventoryConfig, setCurrentInventoryConfig] = useState({});
    const [loading, setLoading] = useState(true);

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoryId, setFilterCategoryId] = useState('');

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewMovementsProduct, setViewMovementsProduct] = useState(null);

    // Load initial data
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                const [cats, uns, pres, invs] = await Promise.all([
                    categoryService.getCategories(inventoryId ? { inventory_id: inventoryId } : {}),
                    productService.getUnits(),
                    productService.getPresentations(),
                    dashboardService.getStats().then(data => data.inventories)
                ]);
                setCategories(cats);
                setUnits(uns);
                setPresentations(pres);
                setInventories(invs);

                if (inventoryId) {
                    const invDetail = await dashboardService.getInventory(inventoryId);
                    setCurrentInventoryConfig(invDetail.config || {});
                }
            } catch (error) {
                console.error('Error loading metadata:', error);
            }
        };
        loadMetadata();
    }, [inventoryId]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (inventoryId) params.inventory_id = inventoryId;
            if (searchTerm) params.search = searchTerm;
            if (filterCategoryId) params.category_id = filterCategoryId;

            console.log('Fetching products with params:', params);
            const data = await productService.getProducts(params);
            console.log('Products received:', data);
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [inventoryId, searchTerm, filterCategoryId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = () => fetchProducts();
    const handleClear = () => {
        setSearchTerm('');
        setFilterCategoryId('');
        fetchProducts();
    };

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data) => {
        try {
            const finalData = { ...data };
            if (inventoryId) finalData.inventory = inventoryId;

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, finalData);
            } else {
                await productService.createProduct(finalData);
            }
            setIsFormOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto. Verifique los datos.');
        }
    };

    const handleViewMore = (product) => {
        setViewMovementsProduct(product);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await productService.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            alert('No se pudo eliminar el producto.');
        }
    };

    const currentInventoryName = inventoryId && inventories.length > 0
        ? inventories.find(inv => inv.id.toString() === inventoryId)?.name
        : '';

    const formatStock = (prod) => {
        const baseStock = Number(prod.current_stock);
        const perPresentation = Number(prod.quantity_per_presentation);

        if (!perPresentation || perPresentation <= 0) {
            return `${baseStock} ${prod.unit_name}`;
        }

        const presentations = Math.floor(baseStock / perPresentation);
        const remainder = baseStock % perPresentation;

        if (remainder > 0) {
            return `${presentations} ${prod.presentation_name} + ${remainder} ${prod.unit_name}`;
        }

        return null; 
    };

    return (
        <DashboardLayout role={user?.role || 'personal'} isSpecificView={!!inventoryId} inventoryId={inventoryId}>
            <div className="products-page">
                <div className="products-header">
                    <div className="header-left">
                        <h1 className="products-title">
                            {inventoryId ? `Productos de ${currentInventoryName || 'Cargando...'}` : 'Tus Productos'}
                        </h1>
                        {!isAdmin && (
                            <div className="products-subtitle">
                                <strong>Registra a tus productos</strong>
                                <span>Aquí puedes registrar tus productos de la mejor manera</span>
                            </div>
                        )}
                    </div>
                    <div className="header-right">
                        {(!isAdmin || (isAdmin && inventoryId)) && (
                            <button className="btn-register-product" onClick={handleOpenCreate}>
                                <Plus size={20} /> Registrar Producto
                            </button>
                        )}
                        {isAdmin && inventoryId && (
                            <button className="category-close-btn" onClick={() => navigate('/admin')} title="Cerrar">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="products-search-section">
                    <h3 className="search-label">Buscar Productos</h3>
                    <div className="search-row">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Busca un producto por su nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="inventory-selector-wrapper">
                            <Layers className="inventory-icon" size={20} />
                            <select
                                value={inventoryId || ''}
                                onChange={(e) => navigate(e.target.value ? `/inventory/${e.target.value}/products` : '/products')}
                            >
                                <option value="">Filtrar por inventario</option>
                                {inventories.map(inv => (
                                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-search" onClick={handleSearch}>Buscar</button>
                        <button className="btn-clear" onClick={handleClear}><RotateCcw size={18} /> Limpiar</button>
                    </div>
                </div>

                <div className="products-table-container">
                    {loading ? (
                        <div className="loading-state">Cargando productos...</div>
                    ) : products.length > 0 ? (
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Categoria</th>
                                    <th>Presentacion</th>
                                    <th>Unidad base</th>
                                    <th>Cantidad*
                                        presentacion</th>
                                    <th>Stock minimo</th>
                                    <th>Stock actual</th>
                                    <th>Fecha 
                                        vencimiento</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(prod => (
                                    <tr key={prod.id}>
                                        <td className="col-name">
                                            <div className="prod-name-box">
                                                <h3>{prod.name}</h3>
                                                {prod.concentration && <span>({prod.concentration})</span>}
                                                <small>{prod.code}</small>
                                            </div>
                                        </td>
                                        <td>{prod.category_name}</td>
                                        <td>{prod.presentation_name || '-'}</td>
                                        <td>{prod.unit_name}</td>
                                        <td className='cant_present'>{prod.quantity_per_presentation}</td>
                                        <td>
                                            {prod.stock_min_presentations} {prod.presentation_name || 'u'}
                                            <div className="unit-conversion">({prod.stock_min_presentations * prod.quantity_per_presentation} {prod.unit_name})</div>
                                        </td>
                                        <td className="col-stock">
                                            <div
                                                className={
                                                    prod.current_stock <=
                                                    (prod.stock_min_presentations * prod.quantity_per_presentation)
                                                        ? 'low-stock'
                                                        : ''
                                                }
                                            >
                                                {/* Línea principal (grande) */}
                                                <div className="stock-main">
                                                    {Math.floor(prod.current_stock / prod.quantity_per_presentation)} {prod.presentation_name || 'u'}
                                                </div>

                                                {/* Línea secundaria (gris y pequeña) */}
                                                {formatStock(prod) && (
                                                    <div className="stock-detail">
                                                        ({formatStock(prod)})
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className='cant_present'>{prod.expiration_date ? new Date(prod.expiration_date).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <div className="action-btns">
                                                {isAdmin && (
                                                    <button className="btn-view-more" onClick={() => handleViewMore(prod)}>Ver mas</button>
                                                )}
                                                <button className="btn-delete-row" onClick={() => handleDelete(prod.id)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <Search size={40} />
                            <p>No se encontraron productos en este inventario.</p>
                        </div>
                    )}
                </div>
            </div>

            <ProductFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                product={editingProduct}
                categories={categories}
                units={units}
                presentations={presentations}
                config={currentInventoryConfig}
            />

            {viewMovementsProduct && (
                <ProductMovementsModal
                    isOpen={!!viewMovementsProduct}
                    onClose={() => setViewMovementsProduct(null)}
                    product={viewMovementsProduct}
                />
            )}
        </DashboardLayout>
    );
};

export default ProductsPage;
