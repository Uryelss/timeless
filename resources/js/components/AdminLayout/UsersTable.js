import React from "react";

const AdminUserTable = ({
    users,
    viewArchived,
    handleUpdate,
    handleArchive,
    handleRestore,
}) => {
    const handleIconClick = (action, userId) => {
        if (action === "update") {
            const user = users.find((u) => u.id === userId);
            handleUpdate(user);
        } else if (action === "archive") handleArchive(userId);
        else if (action === "restore") handleRestore(userId);
    };

    return (
        <div className="user-table-container">
            <table className="user-table">
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
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="no-data">
                                No {viewArchived ? "archived" : "active"} users
                                found.
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td className="actions">
                                    {!viewArchived ? (
                                        <>
                                            <i
                                                className="fa-solid fa-pen-to-square action-icon"
                                                onClick={() =>
                                                    handleIconClick(
                                                        "update",
                                                        user.id
                                                    )
                                                }
                                                title="Update"
                                            ></i>
                                            <i
                                                className="fa-solid fa-box-archive action-icon"
                                                onClick={() =>
                                                    handleIconClick(
                                                        "archive",
                                                        user.id
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
                                                    user.id
                                                )
                                            }
                                            className="restore-btn"
                                        >
                                            Restore
                                        </button>
                                    )}
                                </td>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role || "N/A"}</td>
                                <td>{user.status || "N/A"}</td>
                                <td>
                                    {new Date(user.created_at).toLocaleString()}
                                </td>
                                <td>
                                    {new Date(user.updated_at).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserTable;
