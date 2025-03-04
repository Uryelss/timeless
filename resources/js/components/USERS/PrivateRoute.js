import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
        console.warn("No token found. Redirecting to login.");
        return <Navigate to="/login" replace />; // ✅ Redirect if no token
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.warn(
            `Unauthorized role (${userRole}). Redirecting to homepage.`
        );
        return (
            <Navigate
                to={userRole === "admin" ? "/admin-dashboard" : "/Homepage"}
                replace
            />
        );
    }

    return children;
};

export default PrivateRoute;
