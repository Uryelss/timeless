import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../AdminLayout/Sidebar"; // Assuming you want the sidebar
import UserTable from "../AdminLayout/UsersTable"; // Corrected import name

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [archivedUsers, setArchivedUsers] = useState([]);
    const [viewArchived, setViewArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [editData, setEditData] = useState({
        username: "",
        email: "",
        role_id: "",
    });

    useEffect(() => {
        fetchUsers();
        fetchArchivedUsers();
    }, []);

    // Fetch active users
    const fetchUsers = () => {
        axios
            .get("http://localhost:8000/api/users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setUsers(response.data))
            .catch((error) => console.error("Error fetching users:", error));
    };

    // Fetch archived users
    const fetchArchivedUsers = () => {
        axios
            .get("http://localhost:8000/api/users/archived", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setArchivedUsers(response.data))
            .catch((error) =>
                console.error("Error fetching archived users:", error)
            );
    };

    // Filter users based on search query
    const filteredUsers = (viewArchived ? archivedUsers : users).filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle user update (open modal)
    const handleUpdate = (user) => {
        setSelectedUser(user);
        setEditData({
            username: user.username,
            email: user.email,
            role_id: user.role_id || "2", // Default to "User" if undefined
        });
    };

    // Handle archiving a user
    const handleArchive = (id) => {
        if (window.confirm("Are you sure you want to archive this user?")) {
            axios
                .put(
                    `http://localhost:8000/api/users/${id}/archive`,
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
                    alert("User archived successfully!");
                    fetchUsers();
                    fetchArchivedUsers();
                })
                .catch((error) => {
                    console.error("Error archiving user:", error);
                    alert("Failed to archive user.");
                });
        }
    };

    // Handle restoring a user
    const handleRestore = (id) => {
        if (window.confirm("Are you sure you want to restore this user?")) {
            axios
                .put(
                    `http://localhost:8000/api/users/${id}/restore`,
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
                    alert("User restored successfully!");
                    fetchUsers();
                    fetchArchivedUsers();
                })
                .catch((error) => {
                    console.error("Error restoring user:", error);
                    alert("Failed to restore user.");
                });
        }
    };

    // Submit updated user data
    const submitUpdate = (id) => {
        if (!editData.role_id) {
            alert("Please select a role before updating.");
            return;
        }

        axios
            .put(`http://localhost:8000/api/users/${id}`, editData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then(() => {
                alert("User updated successfully!");
                fetchUsers();
                setSelectedUser(null); // Close modal
            })
            .catch((error) => {
                console.error("Update error:", error.response);
                alert("Failed to update user. Check console for details.");
            });
    };

    return (
        <div className="user-management-container">
            <Sidebar />
            <div className="user-content">
                <h1> User </h1>
                <div className="user-actions">
                    <div className="search-and-select">
                        <div className="search-container">
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-bar"
                            />
                        </div>
                        {/* Add Select All if you implement multi-select */}
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => setViewArchived(!viewArchived)}>
                            {viewArchived
                                ? "View Active Users"
                                : "View Archived Users"}
                        </button>
                    </div>
                </div>
                <UserTable
                    users={filteredUsers}
                    viewArchived={viewArchived}
                    handleUpdate={handleUpdate}
                    handleArchive={handleArchive}
                    handleRestore={handleRestore}
                />
                {selectedUser && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Update User</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitUpdate(selectedUser.id);
                                }}
                            >
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={editData.username}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            username: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <label>Role:</label>
                                <select
                                    value={editData.role_id}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            role_id: e.target.value,
                                        })
                                    }
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="1">Admin</option>
                                    <option value="2">User</option>
                                </select>
                                <div className="modal-buttons">
                                    <button type="submit">Save Changes</button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUserManagement;
