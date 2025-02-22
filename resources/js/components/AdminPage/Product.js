import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../AdminLayout/Sidebar"; // Ensure correct path
import Table from "../AdminLayout/ProductTable"; // Ensure correct path

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchArchivedProducts();
    }, []);

    const fetchProducts = async () => {
        const response = await axios.get("/api/products");
        setProducts(response.data);
    };

    const fetchArchivedProducts = async () => {
        const response = await axios.get("/api/products/archived");
        setArchivedProducts(response.data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, product_image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataObject = new FormData();
        Object.keys(formData).forEach((key) => {
            formDataObject.append(key, formData[key]);
        });

        if (editMode) {
            formDataObject.append("_method", "PUT");
            await axios
                .post(`/api/products/${editId}`, formDataObject, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                .then(() => {
                    setShowForm(false);
                    setEditMode(false);
                    setEditId(null);
                    fetchProducts();
                })
                .catch((error) => {
                    console.error("Error updating product:", error);
                });
        } else {
            await axios
                .post("/api/products", formDataObject, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                .then(() => {
                    setShowForm(false);
                    setEditMode(false);
                    setEditId(null);
                    fetchProducts();
                })
                .catch((error) => {
                    console.error("Error adding product:", error);
                });
        }
    };

    const handleEdit = (product) => {
        setFormData({
            product_name: product.product_name,
            price: product.price,
            category: product.category,
            brand: product.brand,
            movement: product.movement,
            strap_material: product.strap_material,
            gender: product.gender,
            size: product.size,
        });
        setEditId(product.id);
        setEditMode(true);
        setShowForm(true);
    };

    const handleArchive = async (id) => {
        await axios.put(`/api/products/archive/${id}`);
        fetchProducts();
    };

    const restoreProduct = async (id) => {
        await axios.put(`/api/products/restore/${id}`);
        fetchArchivedProducts();
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        setSelectedProducts(
            selectAll
                ? []
                : (showArchived ? archivedProducts : products).map(
                      (product) => product.id
                  )
        );
    };

    const handleSelectProduct = (id) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(
                selectedProducts.filter((productId) => productId !== id)
            );
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const handleArchiveSelected = () => {
        selectedProducts.forEach((id) => handleArchive(id));
        setSelectedProducts([]);
    };

    return (
        <div className="admin-page">
            <Sidebar />
            <div className="content">
                <div className="header-actions">
                    <h2>Product Management</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="add-product-btn"
                    >
                        {showForm ? "Close Form" : "Add Product"}
                    </button>
                </div>

                <button onClick={() => setShowArchived(!showArchived)}>
                    {showArchived
                        ? "Show Active Products"
                        : "Show Archived Products"}
                </button>

                {showForm && (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="file"
                            name="product_image"
                            onChange={handleFileChange}
                            required={!editMode}
                        />
                        <input
                            type="text"
                            name="product_name"
                            placeholder="Product Name"
                            onChange={handleChange}
                            value={formData.product_name || ""}
                            required
                        />
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            onChange={handleChange}
                            value={formData.price || ""}
                            required
                        />
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            onChange={handleChange}
                            value={formData.category || ""}
                            required
                        />
                        <input
                            type="text"
                            name="brand"
                            placeholder="Brand"
                            onChange={handleChange}
                            value={formData.brand || ""}
                            required
                        />
                        <input
                            type="text"
                            name="movement"
                            placeholder="Movement"
                            onChange={handleChange}
                            value={formData.movement || ""}
                            required
                        />
                        <input
                            type="text"
                            name="strap_material"
                            placeholder="Strap Material"
                            onChange={handleChange}
                            value={formData.strap_material || ""}
                            required
                        />
                        <input
                            type="text"
                            name="gender"
                            placeholder="Gender"
                            onChange={handleChange}
                            value={formData.gender || ""}
                            required
                        />
                        <input
                            type="text"
                            name="size"
                            placeholder="Size"
                            onChange={handleChange}
                            value={formData.size || ""}
                            required
                        />
                        <button type="submit">
                            {editMode ? "Update Product" : "Save Product"}
                        </button>
                    </form>
                )}

                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectAll}
                    />
                    {selectAll && (
                        <button
                            onClick={handleArchiveSelected}
                            disabled={selectedProducts.length === 0}
                            className="action-button"
                        >
                            <i className="fa-solid fa-box-archive"></i>
                        </button>
                    )}
                </div>

                <Table
                    products={showArchived ? archivedProducts : products}
                    handleEdit={handleEdit}
                    handleArchive={handleArchive}
                    handleSelectProduct={handleSelectProduct}
                    selectedProducts={selectedProducts}
                />
            </div>
        </div>
    );
};

export default ProductManagement;
