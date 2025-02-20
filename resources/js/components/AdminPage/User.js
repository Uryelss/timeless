import React, { useState, useEffect } from "react";
import axios from "axios";

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        role: "user",
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await axios.get("/api/users");
        setUsers(response.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("/api/users", formData);
        fetchUsers();
    };

    return (
        <div>
            <h2>User Management</h2>
            <button
                onClick={() =>
                    (document.getElementById("userForm").style.display =
                        "block")
                }
            >
                Add User
            </button>

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
                            <td>{user.role}</td>
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
                                <button>Edit</button>
                                <button
                                    onClick={() =>
                                        axios
                                            .delete(`/api/users/${user.id}`)
                                            .then(fetchUsers)
                                    }
                                >
                                    Archive
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div id="userForm" style={{ display: "none" }}>
                <h3>Add User</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
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
                        placeholder="Password"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        required
                    />
                    <select
                        onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                        }
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
};

export default UserPage;
