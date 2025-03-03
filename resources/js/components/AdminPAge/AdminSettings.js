import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminSettings = () => {
    const [filters, setFilters] = useState({
        brands: [],
        categories: [],
        movements: [],
        strapMaterials: [],
        genders: [],
        sizes: [],
    });

    const [newFilter, setNewFilter] = useState("");
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [editName, setEditName] = useState("");
    const [filterType, setFilterType] = useState("brands");

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = () => {
        axios
            .get("http://localhost:8000/api/admin-settings", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setFilters(response.data))
            .catch((error) => console.error("Error fetching data:", error));
    };

    // ✅ Handle adding a new filter
    const handleAdd = () => {
        axios
            .post(
                `http://localhost:8000/api/add-filter/${filterType}`,
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
            })
            .catch(() => alert("Failed to add filter."));
    };

    // ✅ Handle opening modal for updating
    const handleEdit = (type, id, name) => {
        setSelectedFilter({ type, id });
        setEditName(name);
    };

    // ✅ Handle filter update
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

    // ✅ Handle Archive / Restore
    const handleArchiveRestore = (type, id, action) => {
        axios
            .put(
                `http://localhost:8000/api/${action}-filter/${type}/${id}`,
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

    return (
        <div>
            <h1>Admin Settings</h1>

            <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
            >
                <option value="brands">Brand</option>
                <option value="categories">Category</option>
                <option value="movements">Movement</option>
                <option value="strapMaterials">Strap Material</option>
                <option value="genders">Gender</option>
                <option value="sizes">Size</option>
            </select>
            <input
                type="text"
                value={newFilter}
                onChange={(e) => setNewFilter(e.target.value)}
                placeholder="New Filter Name"
            />
            <button onClick={handleAdd}>Add Filter</button>

            {[
                "brands",
                "categories",
                "movements",
                "strapMaterials",
                "genders",
                "sizes",
            ].map((type) => (
                <div key={type}>
                    <h2>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                    <ul>
                        {filters[type]?.map((filter) => (
                            <li key={filter.id}>
                                {filter.name}
                                <button
                                    onClick={() =>
                                        handleEdit(type, filter.id, filter.name)
                                    }
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() =>
                                        handleArchiveRestore(
                                            type,
                                            filter.id,
                                            "archive"
                                        )
                                    }
                                >
                                    Archive
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {selectedFilter && (
                <div className="modal show">
                    <div className="modal-content">
                        <h2>Edit Filter</h2>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                        <button onClick={submitUpdate}>Save</button>
                        <button onClick={() => setSelectedFilter(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
