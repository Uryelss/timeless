import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            navigate("/login"); // Redirect if no token
            return;
        }

        fetch("http://127.0.0.1:8000/api/user", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => setUser(data.user))
            .catch((error) => {
                console.error("Error fetching user data", error);
                navigate("/login"); // Redirect if error occurs
            });
    }, [navigate]);

    return (
        <AdminLayout>
            <div className="dashboard-container">
                <h2>Dashboard</h2>
                {user ? (
                    <div>
                        <h3>Welcome, {user.first_name}!</h3>
                        <p>Email: {user.email}</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
