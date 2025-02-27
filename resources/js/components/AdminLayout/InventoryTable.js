import React from "react";

const InventoryTable = ({
    inventory,
    viewArchived,
    handleArchive,
    handleRestore,
    handleArchiveAll,
    selectedItems,
    setSelectedItems,
    selectedItem,
    setSelectedItem,
    updatedStock,
    setUpdatedStock,
    handleUpdateStock,
    fetchInventory,
    fetchArchivedInventory,
}) => {
    const handleCheckboxChange = (itemId) => {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleIconClick = (action, itemId) => {
        if (action === "archive") handleArchive(itemId);
        else if (action === "restore") handleRestore(itemId);
        else if (action === "update") {
            const item = inventory.find((i) => i.id === itemId);
            setSelectedItem(itemId);
            setUpdatedStock(item.stock_quantity);
        }
    };

    return (
        <div className="product-table-container">
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>ID</th>
                        <th>Product Image</th>
                        <th>Product Name</th>
                        <th>Stock Quantity</th>
                        <th>Sold</th>
                        <th>Stock Status</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="no-data">
                                No {viewArchived ? "archived" : "active"}{" "}
                                inventory items found.
                            </td>
                        </tr>
                    ) : (
                        inventory.map((item) => (
                            <tr key={item.id}>
                                <td className="actions">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(
                                            item.id
                                        )}
                                        onChange={() =>
                                            handleCheckboxChange(item.id)
                                        }
                                        className="action-checkbox"
                                    />
                                    {!viewArchived ? (
                                        <>
                                            <i
                                                className="fa-solid fa-pen-to-square action-icon"
                                                onClick={() =>
                                                    handleIconClick(
                                                        "update",
                                                        item.id
                                                    )
                                                }
                                                title="Update Stock"
                                            ></i>
                                            <i
                                                className="fa-solid fa-box-archive action-icon"
                                                onClick={() =>
                                                    handleIconClick(
                                                        "archive",
                                                        item.id
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
                                                    item.id
                                                )
                                            }
                                            className="restore-btn"
                                        >
                                            Restore
                                        </button>
                                    )}
                                </td>
                                <td>{item.id}</td>
                                <td>
                                    <img
                                        src={`http://localhost:8000/storage/${item.product_image}`}
                                        alt={item.product_name}
                                        width="50"
                                    />
                                </td>
                                <td>{item.product_name}</td>
                                <td>
                                    {selectedItem === item.id ? (
                                        <div className="stock-update">
                                            <input
                                                type="number"
                                                value={updatedStock}
                                                onChange={(e) =>
                                                    setUpdatedStock(
                                                        e.target.value
                                                    )
                                                }
                                                min="0"
                                                className="stock-input"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleUpdateStock(item.id)
                                                }
                                                className="save-btn"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setSelectedItem(null)
                                                }
                                                className="cancel-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        item.stock_quantity
                                    )}
                                </td>
                                <td>{item.sold || "N/A"}</td>
                                <td>{item.stock_status || "N/A"}</td>
                                <td>
                                    {new Date(item.updated_at).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
