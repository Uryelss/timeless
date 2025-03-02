import React from "react";

const CustomerTable = ({
    customers,
    viewArchived,
    handleEdit,
    handleArchiveRestore,
}) => {
    const handleIconClick = (action, customerId) => {
        if (action === "edit") {
            handleEdit(customerId);
        } else if (action === "archive" || action === "restore") {
            handleArchiveRestore(customerId, action);
        }
    };

    return (
        <div className="customer-table-container">
            <table className="customer-table">
                <thead>
                    <tr>
                        <th>Actions</th>
                        <th>Customer Image</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Date of Birth</th>
                        <th>Gender</th>
                        <th>Address</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="no-data">
                                No {viewArchived ? "archived" : "active"}{" "}
                                customers found.
                            </td>
                        </tr>
                    ) : (
                        customers.map((customer) => (
                            <tr key={customer.id}>
                                <td className="actions">
                                    <i
                                        className="fa-solid fa-pen-to-square action-icon"
                                        onClick={() =>
                                            handleIconClick("edit", customer.id)
                                        }
                                        title="Edit"
                                    ></i>
                                    {!viewArchived ? (
                                        <i
                                            className="fa-solid fa-box-archive action-icon"
                                            onClick={() =>
                                                handleIconClick(
                                                    "archive",
                                                    customer.id
                                                )
                                            }
                                            title="Archive"
                                        ></i>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleIconClick(
                                                    "restore",
                                                    customer.id
                                                )
                                            }
                                            className="restore-btn"
                                        >
                                            Restore
                                        </button>
                                    )}
                                </td>
                                <td>
                                    <img
                                        src={customer.profile_image}
                                        width="50"
                                        alt="Customer"
                                        onError={(e) =>
                                            (e.target.src =
                                                "/default-profile.png")
                                        }
                                    />
                                </td>
                                <td>{customer.full_name}</td>
                                <td>{customer.phone || "N/A"}</td>
                                <td>{customer.date_of_birth || "N/A"}</td>
                                <td>{customer.gender || "N/A"}</td>
                                <td>{customer.address || "No Address"}</td>
                                <td>
                                    {new Date(
                                        customer.updated_at
                                    ).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerTable;
