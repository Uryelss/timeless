import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [archivedUsers, setArchivedUsers] = useState([]);
    const [viewArchived, setViewArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // ✅ State for User Update
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

    // ✅ Fetch Active Users
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

    // ✅ Fetch Archived Users
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

    // ✅ Archive User
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
                .catch(() => alert("Failed to archive user."));
        }
    };

    // ✅ Restore User
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
                .catch(() => alert("Failed to restore user."));
        }
    };

    // ✅ Handle User Update (Opens Modal)
    const handleUpdate = (user) => {
        console.log("Opening Update Modal for User:", user);
        setSelectedUser(user);
        setEditData({
            username: user.username,
            email: user.email,
            role_id: user.role_id || "2", // Default to "User" if undefined
        });
    };

    // ✅ Submit Updated User Data
    const submitUpdate = (id) => {
        console.log("Submitting Update for User ID:", id, editData); // Debugging

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

    // ✅ Filter Users Based on Search Query
    const filteredUsers = (viewArchived ? archivedUsers : users).filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <h1>Admin User Management</h1>

            <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={() => setViewArchived(!viewArchived)}>
                {viewArchived ? "View Active Users" : "View Archived Users"}
            </button>

            <table>
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Date Added</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user.id}>
                            <td>
                                {!viewArchived ? (
                                    <>
                                        <button
                                            onClick={() => handleUpdate(user)}
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleArchive(user.id)
                                            }
                                        >
                                            Archive
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleRestore(user.id)}
                                    >
                                        Restore
                                    </button>
                                )}
                            </td>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.status}</td>
                            <td>{user.created_at}</td>
                            <td>{user.updated_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ Update Modal (Always in return, not inside handleUpdate) */}
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
    );
};

export default AdminUserManagement;
