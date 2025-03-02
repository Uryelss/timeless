import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const AdminCustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [viewArchived, setViewArchived] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editData, setEditData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        profile_image: null,
    });

    useEffect(() => {
        fetchCustomers();
    }, [viewArchived]);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/customers?archived=${viewArchived}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setCustomers(response.data);
        } catch (error) {
            console.error(
                "Error fetching customers:",
                error?.response || error
            );
        }
    };

    const handleEdit = async (customerId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/customers/${customerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            setSelectedCustomer(response.data);
            setEditData({
                first_name: response.data.first_name || "",
                middle_name: response.data.middle_name || "",
                last_name: response.data.last_name || "",
                phone: response.data.phone || "",
                date_of_birth: response.data.date_of_birth || "",
                gender: response.data.gender || "",
                profile_image: null,
            });
        } catch (error) {
            console.error("Error fetching customer details:", error);
            alert("Failed to fetch customer details.");
        }
    };
    const handleArchiveRestore = async (id, action) => {
        const confirmMessage = action === "restore" ? "restore" : "archive";
        if (
            !window.confirm(
                `Are you sure you want to ${confirmMessage} this customer?`
            )
        )
            return;

        try {
            await axios.put(
                `http://localhost:8000/api/customers/${id}/${action}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            alert(`Customer ${confirmMessage}d successfully!`);
            fetchCustomers();
        } catch {
            alert(`Failed to ${confirmMessage} customer.`);
        }
    };

    // ✅ Handle Update Submission
    const submitUpdate = async (id) => {
        try {
            const formData = new FormData();
            formData.append("first_name", editData.first_name || "");
            formData.append("middle_name", editData.middle_name || "");
            formData.append("last_name", editData.last_name || "");
            formData.append("phone", editData.phone || "");
            formData.append("date_of_birth", editData.date_of_birth || "");
            formData.append("gender", editData.gender || "");

            if (editData.profile_image) {
                formData.append("profile_image", editData.profile_image);
            }

            const response = await axios.post(
                `http://localhost:8000/api/customers/${id}/update`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            console.log("Update Response:", response.data);
            alert("Customer updated successfully!");
            fetchCustomers();
            setSelectedCustomer(null);
        } catch (error) {
            console.error("Update error:", error.response);
            alert("Failed to update customer.");
        }
    };

    const memoizedCustomers = useMemo(() => customers, [customers]);

    return (
        <div>
            <h1>Admin Customer Management</h1>
            <button onClick={() => setViewArchived(!viewArchived)}>
                {viewArchived
                    ? "View Active Customers"
                    : "View Archived Customers"}
            </button>

            <table>
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
                    {memoizedCustomers.map((customer) => (
                        <tr key={customer.id}>
                            <td>
                                <button onClick={() => handleEdit(customer.id)}>
                                    Edit
                                </button>

                                {!viewArchived ? (
                                    <button
                                        onClick={() =>
                                            handleArchiveRestore(
                                                customer.id,
                                                "archive"
                                            )
                                        }
                                    >
                                        Archive
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleArchiveRestore(
                                                customer.id,
                                                "restore"
                                            )
                                        }
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
                                        (e.target.src = "/default-profile.png")
                                    }
                                />
                            </td>
                            <td>{customer.full_name}</td>
                            <td>{customer.phone || "N/A"}</td>
                            <td>{customer.date_of_birth || "N/A"}</td>
                            <td>{customer.gender || "N/A"}</td>
                            <td>{customer.address || "No Address"}</td>
                            <td>{customer.updated_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedCustomer && (
                <div className="modal show">
                    <div className="modal-content">
                        <h2>Edit Customer</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submitUpdate(selectedCustomer.id);
                            }}
                        >
                            <label>First Name:</label>
                            <input
                                type="text"
                                value={editData.first_name}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        first_name: e.target.value,
                                    })
                                }
                            />

                            <label>Middle Name (Optional):</label>
                            <input
                                type="text"
                                value={editData.middle_name}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        middle_name: e.target.value,
                                    })
                                }
                            />

                            <label>Last Name:</label>
                            <input
                                type="text"
                                value={editData.last_name}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        last_name: e.target.value,
                                    })
                                }
                            />

                            <label>Phone:</label>
                            <input
                                type="text"
                                value={editData.phone}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        phone: e.target.value,
                                    })
                                }
                            />

                            <label>Date of Birth:</label>
                            <input
                                type="date"
                                value={editData.date_of_birth}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        date_of_birth: e.target.value,
                                    })
                                }
                            />

                            <label>Gender:</label>
                            <select
                                value={editData.gender}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        gender: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>

                            <label>Profile Image:</label>
                            <input
                                type="file"
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        profile_image: e.target.files[0],
                                    })
                                }
                            />

                            <div className="modal-buttons">
                                <button type="submit">Save Changes</button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCustomer(null)}
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

export default AdminCustomerManagement;
