import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import categoryService from '../../services/categoryService';

const CategoryProductsModal = ({ isOpen, onClose, category }) => {
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && category) {
            fetchProducts();
        }
    }, [isOpen, category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getCategoryProducts(category.id);
            setProducts(data.products || []);
            setCategoryName(data.category_name || category.name);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="products-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="products-modal-header">
                    <h2 className="products-modal-title">
                        Productos de la categoria {categoryName}
                    </h2>
                    <button className="products-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="products-modal-body">
                    {loading ? (
                        <p className="products-loading">Cargando productos...</p>
                    ) : products.length > 0 ? (
                        <table className="products-modal-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.display_name || product.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="products-empty">No hay productos en esta categoría.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryProductsModal;
