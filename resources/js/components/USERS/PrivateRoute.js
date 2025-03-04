import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    const location = useLocation();

    console.log("User Role:", userRole);
    console.log("Token:", token);

    if (!token) {
        console.warn("No token found. Redirecting to login.");
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.warn(
            `Unauthorized role (${userRole}). Redirecting to homepage.`
        );

        return userRole === "admin" ? (
            <Navigate to="/admin-dashboard" state={{ from: location }} />
        ) : (
            <Navigate to="/Homepage" state={{ from: location }} />
        );
    }

    return children;
};

export default PrivateRoute;
