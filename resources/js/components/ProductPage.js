import React, { useState, useEffect } from "react";

// The ProductForm component will handle adding new products
const ProductForm = ({ onAddProduct }) => {
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [movement, setMovement] = useState("");
    const [strapMaterial, setStrapMaterial] = useState("");
    const [gender, setGender] = useState("");
    const [size, setSize] = useState("");
    const [image, setImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !productName ||
            !price ||
            !category ||
            !brand ||
            !movement ||
            !strapMaterial ||
            !gender ||
            !size ||
            !image
        ) {
            setErrorMessage("Please fill out all fields, including the image.");
            return;
        }

        const formData = new FormData();
        formData.append("product_name", productName);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("brand", brand);
        formData.append("movement", movement);
        formData.append("strap_material", strapMaterial);
        formData.append("gender", gender);
        formData.append("size", size);
        formData.append("image", image);

        // Send the product data to the backend
        fetch("http://127.0.0.1:8000/api/products", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    onAddProduct(data.product); // Call onAddProduct to update the table
                    alert("Product added successfully!");
                    resetForm();
                } else {
                    alert("Failed to add product!");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const resetForm = () => {
        setProductName("");
        setPrice("");
        setCategory("");
        setBrand("");
        setMovement("");
        setStrapMaterial("");
        setGender("");
        setSize("");
        setImage(null);
    };

    return (
        <div className="product-form">
            <h3>Add Product</h3>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Product Name</label>
                    <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Price</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
                <div>
                    <label>Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
                <div>
                    <label>Brand</label>
                    <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    />
                </div>
                <div>
                    <label>Movement</label>
                    <input
                        type="text"
                        value={movement}
                        onChange={(e) => setMovement(e.target.value)}
                    />
                </div>
                <div>
                    <label>Strap Material</label>
                    <input
                        type="text"
                        value={strapMaterial}
                        onChange={(e) => setStrapMaterial(e.target.value)}
                    />
                </div>
                <div>
                    <label>Gender</label>
                    <input
                        type="text"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    />
                </div>
                <div>
                    <label>Size</label>
                    <input
                        type="text"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                    />
                </div>
                <div>
                    <label>Product Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

// The main ProductsPage component
const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Fetch products when the component mounts
        fetch("http://127.0.0.1:8000/api/products")
            .then((response) => response.json())
            .then((data) => setProducts(data.products))
            .catch((error) => console.error("Error fetching products:", error));
    }, []);

    const handleAddProduct = (newProduct) => {
        setProducts([...products, newProduct]); // Add the new product to the list
        setShowForm(false); // Hide the form after adding the product
    };

    return (
        <div>
            <h2>Product Management</h2>
            <button onClick={() => setShowForm(true)}>Add Product</button>

            {showForm && <ProductForm onAddProduct={handleAddProduct} />}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Movement</th>
                        <th>Strap Material</th>
                        <th>Gender</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                                <img
                                    src={`http://127.0.0.1:8000/storage/${product.image}`}
                                    alt={product.product_name}
                                    width="50"
                                    height="50"
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductsPage;
