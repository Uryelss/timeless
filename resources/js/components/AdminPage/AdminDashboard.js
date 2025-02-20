import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            navigate("/");
        }
    }, [navigate]);

    return (
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
    );
};

export default AdminDashboard;
