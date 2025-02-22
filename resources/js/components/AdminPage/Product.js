import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

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
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
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
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
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
        try {
            await axios.put(`/api/products/restore/${id}`);
            fetchArchivedProducts(); // Refresh archived products
        } catch (error) {
            console.error("Error restoring product:", error);
        }
    };

    return (
        <div>
            <h2>Product Management</h2>
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close Form" : "Add Product"}
            </button>
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

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product Image</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Movement</th>
                        <th>Strap Material</th>
                        <th>Gender</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(showArchived ? archivedProducts : products).map(
                        (product) => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                    <img
                                        src={`/storage/${product.product_image}`}
                                        alt=""
                                        width="50"
                                    />
                                </td>
                                <td>{product.product_name}</td>
                                <td>{product.price}</td>
                                <td>{product.category}</td>
                                <td>{product.brand}</td>
                                <td>{product.movement}</td>
                                <td>{product.strap_material}</td>
                                <td>{product.gender}</td>
                                <td>{product.size}</td>
                                <td>
                                    <button onClick={() => handleEdit(product)}>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() =>
                                            showArchived
                                                ? restoreProduct(product.id)
                                                : handleArchive(product.id)
                                        }
                                    >
                                        {showArchived ? "Restore" : "Archive"}
                                    </button>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductManagement;
