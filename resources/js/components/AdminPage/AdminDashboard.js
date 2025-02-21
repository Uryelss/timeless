import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../AdminLayout/Sidebar"; // Ensure correct path

const Products = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_image: null,
        product_name: "",
        price: "",
        category: "",
        brand: "",
        movement: "",
        strap_material: "",
        gender: "",
        size: "",
        quantity: "",
        details: "",
    });

    const [editingProduct, setEditingProduct] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false); // Controls form visibility

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/products"
            );
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, product_image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }

        try {
            if (editingProduct) {
                await axios.post(
                    `http://localhost:8000/api/products/${editingProduct.id}?_method=PUT`,
                    formDataToSend,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            } else {
                await axios.post(
                    "http://localhost:8000/api/products",
                    formDataToSend,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
            }
            fetchProducts();
            resetForm();
            setIsFormVisible(false);
        } catch (error) {
            console.error("Error submitting product:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            product_image: null,
            product_name: "",
            price: "",
            category: "",
            brand: "",
            movement: "",
            strap_material: "",
            gender: "",
            size: "",
            quantity: "",
            details: "",
        });
        setEditingProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({ ...product, product_image: null });
        setIsFormVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    return (
        <div className="product-management">
            <Sidebar />
            <div className="content">
                <h2>Product Management</h2>

                <button
                    className="add-product-btn"
                    onClick={() => setIsFormVisible(true)}
                >
                    <i className="fa-solid fa-plus"></i> Add Product
                </button>

                {/* Product Form (Visible when isFormVisible is true) */}
                {isFormVisible && (
                    <div className="product-form">
                        <h3>
                            {editingProduct ? "Edit Product" : "Add Product"}
                        </h3>
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <input
                                type="file"
                                name="product_image"
                                onChange={handleFileChange}
                                required={!editingProduct}
                            />
                            <input
                                type="text"
                                name="product_name"
                                placeholder="Product Name"
                                value={formData.product_name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="price"
                                placeholder="Price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="category"
                                placeholder="Category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="brand"
                                placeholder="Brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="movement"
                                placeholder="Movement"
                                value={formData.movement}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="strap_material"
                                placeholder="Strap Material"
                                value={formData.strap_material}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="gender"
                                placeholder="Gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="size"
                                placeholder="Size (mm)"
                                value={formData.size}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="quantity"
                                placeholder="Quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                name="details"
                                placeholder="Details about watch"
                                value={formData.details}
                                onChange={handleChange}
                                required
                            />

                            <div className="form-buttons">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setIsFormVisible(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingProduct
                                        ? "Update Product"
                                        : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Product Table */}
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" />
                            </th>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
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
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <input type="checkbox" />
                                </td>
                                <td>{product.id}</td>
                                <td>
                                    <img
                                        src={`http://localhost:8000/storage/${product.product_image}`}
                                        width="50"
                                        alt="product"
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
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(product)}
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <i className="fa-solid fa-box-archive"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
