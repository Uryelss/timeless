import React, { useState, useEffect } from "react";
import axios from "axios";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
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
    });

    const [editingProduct, setEditingProduct] = useState(null);

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

    const fetchArchivedProducts = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/products/archived"
            );
            if (response.status === 200) {
                setArchivedProducts(response.data);
            } else {
                alert("Failed to fetch archived products!");
            }
        } catch (error) {
            console.error("Error fetching archived products:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFormData({ ...formData, product_image: e.target.files[0] });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append("product_image", formData.product_image);
        formDataToSend.append("product_name", formData.product_name);
        formDataToSend.append("price", formData.price);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("brand", formData.brand);
        formDataToSend.append("movement", formData.movement);
        formDataToSend.append("strap_material", formData.strap_material);
        formDataToSend.append("gender", formData.gender);
        formDataToSend.append("size", formData.size);

        try {
            let response;
            if (editingProduct) {
                response = await axios.post(
                    `http://localhost:8000/api/products/${editingProduct.id}`,
                    formDataToSend,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            } else {
                response = await axios.post(
                    "http://localhost:8000/api/products",
                    formDataToSend,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            }

            console.log("Response:", response); // <-- Log response

            if (response.status === 200) {
                alert(editingProduct ? "Product Updated!" : "Product Added!");
                fetchProducts();
                resetForm();
            } else {
                alert("Failed to save product!");
            }
        } catch (error) {
            console.error(
                "Error saving product:",
                error.response?.data || error
            );
            alert(
                "Error saving product: " +
                    (error.response?.data?.message || error.message)
            );
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
        });
        setEditingProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({ ...product, product_image: null });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/products/${id}`);
            fetchProducts();
            fetchArchivedProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const restoreProduct = async (id) => {
        try {
            await axios.post(
                `http://localhost:8000/api/products/${id}/restore`
            );
            alert("Product restored successfully!");
            fetchProducts();
            fetchArchivedProducts();
        } catch (error) {
            console.error("Error restoring product:", error);
        }
    };

    return (
        <div>
            <h2>Product Management</h2>
            <button onClick={resetForm}>Add Product</button>
            <button onClick={fetchArchivedProducts}>
                View Archived Products
            </button>

            {/* Product Form */}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                    placeholder="Size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                />
                <button type="submit">
                    {editingProduct ? "Update Product" : "Add Product"}
                </button>
            </form>

            {/* Product List */}
            <table>
                <thead>
                    <tr>
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
                            <td>{product.id}</td>
                            <td>
                                <img
                                    src={`http://localhost:8000/storage/${product.product_image}`}
                                    alt={product.product_name}
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
                                    onClick={() => handleDelete(product.id)}
                                >
                                    Archive
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Products;
