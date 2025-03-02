import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../AdminLayout/Sidebar"; // Importing Sidebar
import InventoryTable from "../AdminLayout/InventoryTable"; // Importing InventoryTable

const InventoryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [archivedInventory, setArchivedInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [viewArchived, setViewArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState([]); // For multi-select
    const [selectedItem, setSelectedItem] = useState(null); // For updating stock
    const [updatedStock, setUpdatedStock] = useState("");

    useEffect(() => {
        fetchInventory();
        fetchArchivedInventory();
    }, []);

    useEffect(() => {
        const filtered = (viewArchived ? archivedInventory : inventory).filter(
            (item) =>
                item.product_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );
        setFilteredInventory(filtered);
    }, [inventory, archivedInventory, viewArchived, searchQuery]);

    const fetchInventory = () => {
        axios
            .get("http://localhost:8000/api/inventory", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setInventory(response.data))
            .catch((error) =>
                console.error("Error fetching inventory:", error)
            );
    };

    const fetchArchivedInventory = () => {
        axios
            .get("http://localhost:8000/api/inventory/archived", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setArchivedInventory(response.data))
            .catch((error) =>
                console.error("Error fetching archived inventory:", error)
            );
    };

    const handleUpdateStock = (id) => {
        if (!updatedStock || updatedStock < 0) {
            alert("Please enter a valid stock quantity.");
            return;
        }
        axios
            .put(
                `http://localhost:8000/api/inventory/${id}`,
                { stock_quantity: updatedStock },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                alert("Stock updated successfully!");
                fetchInventory();
                setSelectedItem(null);
                setUpdatedStock("");
            })
            .catch((error) => {
                console.error("Error updating stock:", error);
                alert("Failed to update stock.");
            });
    };

    const handleArchive = (id) => {
        if (window.confirm("Are you sure you want to archive this item?")) {
            axios
                .put(
                    `http://localhost:8000/api/inventory/${id}/archive`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                .then(() => {
                    alert("Item archived successfully!");
                    fetchInventory();
                    fetchArchivedInventory();
                })
                .catch((error) => {
                    console.error("Error archiving item:", error);
                    alert("Failed to archive item.");
                });
        }
    };

    const handleArchiveAll = () => {
        if (selectedItems.length === 0) {
            alert("Please select items to archive.");
            return;
        }
        if (
            window.confirm(
                "Are you sure you want to archive all selected items?"
            )
        ) {
            Promise.all(
                selectedItems.map((id) =>
                    axios.put(
                        `http://localhost:8000/api/inventory/${id}/archive`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    )
                )
            )
                .then(() => {
                    alert("Items archived successfully!");
                    setSelectedItems([]);
                    fetchInventory();
                    fetchArchivedInventory();
                })
                .catch((error) => {
                    console.error("Error archiving items:", error);
                    alert("Failed to archive some items.");
                });
        }
    };

    const handleRestore = (id) => {
        if (window.confirm("Are you sure you want to restore this item?")) {
            axios
                .put(
                    `http://localhost:8000/api/inventory/${id}/restore`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                .then(() => {
                    alert("Item restored successfully!");
                    fetchInventory();
                    fetchArchivedInventory();
                })
                .catch((error) => {
                    console.error("Error restoring item:", error);
                    alert("Failed to restore item.");
                });
        }
    };

    return (
        <div className="admin-product-container">
            <Sidebar />
            <div className="product-content">
                <h1>Inventory </h1>
                <div className="product-actions">
                    <div className="search-and-select">
                        <div className="search-container">
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search Inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-bar"
                            />
                        </div>
                        <div className="checkbox-actions">
                            <label className="select-all-container">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedItems(
                                                filteredInventory.map(
                                                    (i) => i.id
                                                )
                                            );
                                        } else {
                                            setSelectedItems([]);
                                        }
                                    }}
                                    checked={
                                        selectedItems.length ===
                                            filteredInventory.length &&
                                        filteredInventory.length > 0
                                    }
                                    className="action-checkbox"
                                />
                                Select All
                            </label>
                            {selectedItems.length ===
                                filteredInventory.length &&
                                !viewArchived && (
                                    <button
                                        className="archive-all-btn"
                                        onClick={handleArchiveAll}
                                    >
                                        <i className="fa-solid fa-box-archive action-icon"></i>
                                    </button>
                                )}
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => setViewArchived(!viewArchived)}>
                            {viewArchived
                                ? "View Active Inventory"
                                : "View Archived Inventory"}
                        </button>
                    </div>
                </div>
                <InventoryTable
                    inventory={filteredInventory}
                    viewArchived={viewArchived}
                    handleArchive={handleArchive}
                    handleRestore={handleRestore}
                    handleArchiveAll={handleArchiveAll}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    updatedStock={updatedStock}
                    setUpdatedStock={setUpdatedStock}
                    handleUpdateStock={handleUpdateStock}
                    fetchInventory={fetchInventory}
                    fetchArchivedInventory={fetchArchivedInventory}
                />
            </div>
        </div>
    );
};

export default InventoryManagement;
