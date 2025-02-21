import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../AdminLayout/Sidebar"; // Ensure correct path

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Dashboard Content */}
            <div className="admin-dashboard">
                <h2>Welcome, Admin!</h2>
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate("/");
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
