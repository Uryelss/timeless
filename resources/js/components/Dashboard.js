import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const history = useHistory();

    useEffect(() => {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            history.push("/login"); // Redirect to login if no token
        }

        // Fetch user data with the token (optional: fetch more user data from API)
        fetch("http://127.0.0.1:8000/api/user", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => setUser(data.user))
            .catch((error) => {
                console.error("Error fetching user data", error);
                history.push("/login");
            });
    }, [history]);

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            {user ? (
                <div>
                    <h3>Welcome, {user.first_name}!</h3>
                    {/* Display user data */}
                    <p>Email: {user.email}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Dashboard;
