import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../AdminLayout/Sidebar"; // Ensure correct path

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            navigate("/Admin-dashboard");
        }
    }, [navigate]);

    return (
        <div className="admin-dashboard">
            <Sidebar /> {/* Add Sidebar here */}
            <div className="dashboard-content">
                <h2>Welcome, Admin!</h2>
                {/* You can add other content for the admin dashboard here */}
            </div>
        </div>
    );
};

export default AdminDashboard;
