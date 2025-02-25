import React, { useState, useEffect } from "react";
import axios from "axios";

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

            // Log token to ensure it's retrieved correctly
            console.log("Token:", token);

            const response = await axios.get(
                "http://localhost:8000/api/admin-dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token in request header
                    },
                }
            );

            // Log the response to check its structure
            console.log("Admin data response:", response.data);

            // Set the response data to state
            setAdminData(response.data.adminData); // Store the admin data (user_count, pending_requests)
            setLoading(false); // Stop loading after data is fetched
        } catch (err) {
            // Log the error response to understand what went wrong
            console.log(
                "Error fetching admin data:",
                err.response ? err.response.data : err.message
            );
            setError("Failed to fetch admin data.");
            setLoading(false); // Stop loading on error
        }
    };

    // Call getAdminData when the component mounts
    useEffect(() => {
        getAdminData(); // Fetch data on mount
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {/* Render admin data */}
            <div>
                <h3>User Count: {adminData.user_count}</h3>
                <h3>Pending Requests: {adminData.pending_requests}</h3>
            </div>
        </div>
    );
};

export default AdminDashboard;
