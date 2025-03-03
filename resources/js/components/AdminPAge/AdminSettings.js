import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../AdminLayout/Sidebar";

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("brands");
    const [viewArchived, setViewArchived] = useState(false);
    const [filters, setFilters] = useState({
        brands: [],
        categories: [],
        genders: [],
        movements: [],
        strapMaterials: [],
        sizes: [],
    });
    const [newFilter, setNewFilter] = useState("");
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [editName, setEditName] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchFilters();
    }, [viewArchived]);

    const fetchFilters = () => {
        axios
            .get(
                `http://localhost:8000/api/admin-settings?archived=${viewArchived}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then((response) => setFilters(response.data))
            .catch((error) => console.error("Error fetching data:", error));
    };

    const handleAdd = () => {
        axios
            .post(
                `http://localhost:8000/api/add-filter/${activeTab}`,
                { name: newFilter },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                alert("Filter added successfully!");
                fetchFilters();
                setNewFilter("");
                setIsAddModalOpen(false);
            })
            .catch(() => alert("Failed to add filter."));
    };

    const handleEdit = (id, name) => {
        setSelectedFilter({ type: activeTab, id });
        setEditName(name);
    };

    const submitUpdate = () => {
        axios
            .put(
                `http://localhost:8000/api/update-filter/${selectedFilter.type}/${selectedFilter.id}`,
                { name: editName },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                alert("Filter updated successfully!");
                fetchFilters();
                setSelectedFilter(null);
            })
            .catch(() => alert("Failed to update filter."));
    };

    const handleArchiveRestore = (id, action) => {
        axios
            .put(
                `http://localhost:8000/api/${action}-filter/${activeTab}/${id}`,
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
                alert(`Filter ${action}d successfully!`);
                fetchFilters();
            })
            .catch(() => alert(`Failed to ${action} filter.`));
    };

    const tabs = [
        { id: "brands", label: "Brand" },
        { id: "categories", label: "Categories" },
        { id: "genders", label: "Gender" },
        { id: "movements", label: "Movements" },
        { id: "strapMaterials", label: "Strap Materials" },
        { id: "sizes", label: "Sizes" },
    ];

    const renderTable = (type) => (
        <div className="table-container">
            <div className="table-header">
                {!viewArchived && (
                    <button
                        className="add-btn"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                )}
            </div>
            <table className="settings-table">
                <thead>
                    <tr>
                        <th>Actions</th>
                        <th>{type.charAt(0).toUpperCase() + type.slice(1)}</th>
                    </tr>
                </thead>
                <tbody>
                    {filters[type]?.length === 0 ? (
                        <tr>
                            <td colSpan="2" className="no-data">
                                No {viewArchived ? "archived" : "active"} {type}{" "}
                                found.
                            </td>
                        </tr>
                    ) : (
                        filters[type]?.map((filter) => (
                            <tr key={filter.id}>
                                <td className="actions">
                                    {!viewArchived && (
                                        <>
                                            <i
                                                className="fa-solid fa-pen-to-square action-icon"
                                                onClick={() =>
                                                    handleEdit(
                                                        filter.id,
                                                        filter.name
                                                    )
                                                }
                                                title="Edit"
                                            ></i>
                                            <i
                                                className="fa-solid fa-box-archive action-icon"
                                                onClick={() =>
                                                    handleArchiveRestore(
                                                        filter.id,
                                                        "archive"
                                                    )
                                                }
                                                title="Archive"
                                            ></i>
                                        </>
                                    )}
                                    {viewArchived && (
                                        <button
                                            className="restore-btn"
                                            onClick={() =>
                                                handleArchiveRestore(
                                                    filter.id,
                                                    "restore"
                                                )
                                            }
                                        >
                                            Restore
                                        </button>
                                    )}
                                </td>
                                <td>{filter.name}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-settings-container">
            <Sidebar />
            <div className="settings-content">
                <h1>Admin Settings</h1>
                <div className="settings-actions">
                    <div className="tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${
                                    activeTab === tab.id ? "active" : ""
                                }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button
                        className="toggle-archived-btn"
                        onClick={() => setViewArchived(!viewArchived)}
                    >
                        {viewArchived ? "View Active" : "View Archived"}
                    </button>
                </div>
                {renderTable(activeTab)}

                {/* Add Modal */}
                {isAddModalOpen && (
                    <div className="modal show">
                        <div className="modal-content">
                            <h2>
                                Add{" "}
                                {activeTab.charAt(0).toUpperCase() +
                                    activeTab.slice(1)}
                            </h2>
                            <input
                                type="text"
                                value={newFilter}
                                onChange={(e) => setNewFilter(e.target.value)}
                                placeholder={`New ${activeTab} Name`}
                            />
                            <div className="modal-buttons">
                                <button onClick={handleAdd}>Add</button>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {selectedFilter && (
                    <div className="modal show">
                        <div className="modal-content">
                            <h2>
                                Edit{" "}
                                {selectedFilter.type.charAt(0).toUpperCase() +
                                    selectedFilter.type.slice(1)}
                            </h2>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <div className="modal-buttons">
                                <button onClick={submitUpdate}>Save</button>
                                <button onClick={() => setSelectedFilter(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
