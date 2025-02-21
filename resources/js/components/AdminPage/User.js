import React, { useState, useEffect } from "react";
import axios from "axios";

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        username: "",
        password: "",
        email: "",
        role_id: "1", // Default to User role
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/api/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                role_id: formData.role_id,
                ...(formData.password && { password: formData.password }),
            };

            console.log("Sending update request with:", payload); // Debugging log
            await axios.put(`/api/users/${formData.id}`, {
                username: formData.username,
                email: formData.email,
                role_id: 1, // Hardcoded to test
            });
            alert("User updated successfully!");
            fetchUsers();
            closeForm();
        } catch (error) {
            console.error("Error saving user:", error.response?.data || error);
            alert("Failed to update user. Check console for details.");
        }
    };

    const handleEdit = (user) => {
        setFormData({
            id: user.id,
            username: user.username,
            email: user.email,
            role_id: user.role_id,
            password: "",
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleArchive = async (id) => {
        if (window.confirm("Are you sure you want to archive this user?")) {
            try {
                await axios.delete(`/api/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Error archiving user:", error);
            }
        }
    };

    const closeForm = () => {
        setIsEditing(false);
        setFormData({
            id: null,
            username: "",
            password: "",
            email: "",
            role_id: "1",
        });
        setShowForm(false);
    };

    return (
        <div>
            <h2>User Management</h2>
            <button onClick={() => setShowForm(true)}>Add User</button>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Date Added</th>
                        <th>Last Updated</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>{" "}
                            {/* FIXED: Display Role Name */}
                            <td>
                                {user.created_at
                                    ? new Date(user.created_at).toLocaleString()
                                    : "N/A"}
                            </td>
                            <td>
                                {user.updated_at
                                    ? new Date(user.updated_at).toLocaleString()
                                    : "N/A"}
                            </td>
                            <td>
                                <button onClick={() => handleEdit(user)}>
                                    Edit
                                </button>
                                <button onClick={() => handleArchive(user.id)}>
                                    Archive
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* User Form */}
            {showForm && (
                <div>
                    <h3>{isEditing ? "Edit User" : "Add User"}</h3>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (Leave blank to keep current)"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            required
                        />
                        <select
                            value={formData.role_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role_id: e.target.value,
                                })
                            }
                        >
                            <option value="1">User</option>
                            <option value="2">Admin</option>
                        </select>
                        <button type="submit">
                            {isEditing ? "Update" : "Save"}
                        </button>
                        <button type="button" onClick={closeForm}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserPage;
