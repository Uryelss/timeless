import React from "react";

const ProductTable = ({
    products,
    handleEdit,
    handleArchive,
    handleArchiveAll,
    handleRestore,
    fetchProducts,
    fetchArchivedProducts,
    isArchived,
    selectedProducts,
    setSelectedProducts,
}) => {
    const handleCheckboxChange = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleIconClick = (action, productId) => {
        if (action === "edit")
            handleEdit(products.find((p) => p.id === productId));
        else if (action === "archive") handleArchive(productId);
        else if (action === "restore")
            handleRestore(productId, fetchProducts, fetchArchivedProducts);
    };

    return (
        <div className="product-table-container">
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Movement</th>
                        <th>Strap Material</th>
                        <th>Gender</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan="12" className="no-data">
                                No {isArchived ? "archived" : "active"} products
                                found.
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id}>
                                <td className="actions">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(
                                            product.id
                                        )}
                                        onChange={() =>
                                            handleCheckboxChange(product.id)
                                        }
                                        className="action-checkbox"
                                    />
                                    {!isArchived ? (
                                        <>
                                            <i
                                                className="fa-solid fa-pen-to-square action-icon"
                                                onClick={() =>
                                                    handleIconClick(
                                                        "edit",
                                                        product.id
                                                    )
                                                }
                                                title="Edit"
                                            ></i>
                                            <i
                                                className="fa-solid fa-box-archive action-icon"
                                                onClick={() =>
                                                    handleIconClick(
                                                        "archive",
                                                        product.id
                                                    )
                                                }
                                                title="Archive"
                                            ></i>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleIconClick(
                                                    "restore",
                                                    product.id
                                                )
                                            }
                                            className="restore-btn"
                                        >
                                            Restore
                                        </button>
                                    )}
                                </td>
                                <td>{product.id}</td>
                                <td>
                                    <img
                                        src={`http://localhost:8000/storage/${product.product_image}`}
                                        alt={product.product_name}
                                        width="50"
                                    />
                                </td>
                                <td>{product.product_name}</td>
                                <td>₱{product.price}</td>
                                <td>{product.quantity}</td>
                                <td className="category-column">
                                    {product.category?.name || "N/A"}
                                </td>
                                <td>{product.brand?.name || "N/A"}</td>
                                <td>{product.movement?.name || "N/A"}</td>
                                <td>{product.strap_material?.name || "N/A"}</td>
                                <td>{product.gender?.name || "N/A"}</td>
                                <td>{product.size?.name || "N/A"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
