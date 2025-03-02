import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

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
        return <Navigate to="/Homepage" />;
    }

    return children;
};

export default PrivateRoute;
