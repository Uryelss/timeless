import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../AdminLayout/Sidebar";

const AdminDashboard = () => {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAdminData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No token found. Please log in again.");
                setLoading(false);
                return;
            }
            console.log("Token:", token);
            const response = await axios.get(
                "http://localhost:8000/api/admin-dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Admin data response:", response.data);
            setAdminData(response.data.adminData);
            setLoading(false);
        } catch (err) {
            console.log(
                "Error fetching admin data:",
                err.response ? err.response.data : err.message
            );
            setError("Failed to fetch admin data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        getAdminData();
    }, []);

    return (
        <div className="admin-dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="centered-content">
                        <h1>Admin Dashboard</h1>
                        <div className="data-section">
                            <h3>User Count: {adminData.user_count}</h3>
                            <h3>
                                Pending Requests: {adminData.pending_requests}
                            </h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
